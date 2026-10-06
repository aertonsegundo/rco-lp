import type { CrmResult } from "../respondi";
import type { FileOutbox } from "./file-outbox";
import type { OutboxItem } from "./types";

// ============================================================
// Entrega de UM item da fila ao COMERCIAL e decisão do que fazer com o
// resultado. Não conhece HTTP nem token: recebe `send` pronto.
// ============================================================

/**
 * Espera antes da próxima tentativa, depois de cada falha passageira.
 * Cobre um deploy do COMERCIAL (minutos) e uma queda de horas; depois de
 * ~45 h o item vai para `failed`, que exige alguém olhar.
 */
export const DEFAULT_BACKOFF_MS: readonly number[] = [
  30_000, // 30 s
  2 * 60_000,
  10 * 60_000,
  30 * 60_000,
  2 * 3_600_000,
  6 * 3_600_000,
  12 * 3_600_000,
  24 * 3_600_000,
];

export type LogFn = (event: string, data: Record<string, unknown>) => void;
export type DeliverOutcome = "sent" | "retry" | "failed" | "skipped";

export interface DeliverDeps {
  outbox: FileOutbox;
  send: (item: OutboxItem) => Promise<CrmResult>;
  now?: () => Date;
  backoffMs?: readonly number[];
  log?: LogFn;
}

/** Evita que a entrega imediata e o worker enviem o mesmo lead ao mesmo tempo. */
const inFlight = new Set<string>();

export async function deliverItem(deps: DeliverDeps, id: string): Promise<DeliverOutcome> {
  const { outbox, send, now = () => new Date(), backoffMs = DEFAULT_BACKOFF_MS, log = () => {} } = deps;
  if (inFlight.has(id)) return "skipped";
  inFlight.add(id);
  try {
    const item = outbox.get(id);
    if (!item || item.status !== "pending") return "skipped";

    const at = now();
    let result: CrmResult;
    try {
      result = await send(item);
    } catch (err) {
      result = { kind: "retry", reason: `erro inesperado ao enviar (${err instanceof Error ? err.message : "erro"})` };
    }
    const attempts = item.attempts + 1;
    const base: OutboxItem = { ...item, attempts, lastAttemptAt: at.toISOString() };

    if (result.kind === "sent") {
      outbox.move(
        {
          ...base,
          nextAttemptAt: null,
          lastError: null,
          sentAt: at.toISOString(),
          crm: { httpStatus: result.httpStatus, body: result.body, duplicate: result.duplicate, warning: result.warning },
        },
        "pending",
        "sent",
      );
      log(result.warning ? "lead.sent_with_warning" : "lead.sent", {
        id,
        page: item.page,
        attempts,
        duplicate: result.duplicate,
        warning: result.warning,
      });
      return "sent";
    }

    if (result.kind === "failed") {
      outbox.move(
        {
          ...base,
          nextAttemptAt: null,
          lastError: result.reason,
          crm: { httpStatus: result.httpStatus, body: result.body },
        },
        "pending",
        "failed",
      );
      log("lead.failed", { id, page: item.page, attempts, reason: result.reason });
      return "failed";
    }

    // retry
    if (attempts > backoffMs.length) {
      outbox.move(
        { ...base, nextAttemptAt: null, lastError: `esgotou ${attempts} tentativas: ${result.reason}` },
        "pending",
        "failed",
      );
      log("lead.exhausted", { id, page: item.page, attempts, reason: result.reason });
      return "failed";
    }
    const wait = Math.max(backoffMs[attempts - 1] ?? 0, result.retryAfterMs ?? 0);
    outbox.save({
      ...base,
      nextAttemptAt: new Date(at.getTime() + wait).toISOString(),
      lastError: result.reason,
      crm: result.httpStatus ? { httpStatus: result.httpStatus } : null,
    });
    log("lead.retry_scheduled", { id, page: item.page, attempts, inMs: wait, reason: result.reason });
    return "retry";
  } finally {
    inFlight.delete(id);
  }
}
