import {
  FileOutbox,
  createRateLimiter,
  postLeadToComercial,
  startOutboxWorker,
  type CrmResult,
  type LogFn,
  type OutboxItem,
  type OutboxWorker,
  type RateLimiter,
} from "@rco/lead-core/server";
import type { PageId } from "@/content/pages";
import { readServerEnv, type ServerEnv } from "./env";

// ============================================================
// Estado do servidor (fila, limitadores, worker), criado uma vez por
// processo e guardado em globalThis: o hot-reload do `next dev` recarrega
// módulos, e sem isso cada reload abriria outro worker.
// ============================================================

export interface Runtime {
  env: ServerEnv;
  outbox: FileOutbox;
  send: (item: OutboxItem) => Promise<CrmResult>;
  rateIp: RateLimiter;
  ratePhone: RateLimiter;
  recentByPhone: Map<string, { id: string; at: number }>;
  log: LogFn;
  worker: OutboxWorker | null;
}

const KEY = Symbol.for("rco.lp.runtime");
type G = typeof globalThis & { [KEY]?: Runtime };

/** Log estruturado em uma linha (fácil de filtrar no EasyPanel). */
export const log: LogFn = (event, data) => {
  console.info(JSON.stringify({ evt: event, at: new Date().toISOString(), ...data }));
};

export function getRuntime(): Runtime {
  const g = globalThis as G;
  if (g[KEY]) return g[KEY]!;

  const env = readServerEnv();
  const send = async (item: OutboxItem): Promise<CrmResult> => {
    const token = env.tokens[item.page as PageId];
    // Configuração ausente NÃO perde o lead: fica pendente e sai quando corrigirem.
    if (!env.comercialBaseUrl) return { kind: "retry", reason: "COMERCIAL_BASE_URL não configurada" };
    if (!token) return { kind: "retry", reason: `COMERCIAL_LEAD_TOKEN_${item.page} não configurado` };
    return postLeadToComercial({ baseUrl: env.comercialBaseUrl, token, body: item.payload });
  };

  const rt: Runtime = {
    env,
    outbox: new FileOutbox(env.outboxDir),
    send,
    rateIp: createRateLimiter({ limit: 10, windowMs: 10 * 60_000 }),
    ratePhone: createRateLimiter({ limit: 3, windowMs: 10 * 60_000 }),
    recentByPhone: new Map(),
    log,
    worker: null,
  };
  g[KEY] = rt;
  return rt;
}

export function startWorkerOnce(): void {
  const rt = getRuntime();
  if (rt.worker) return;
  rt.worker = startOutboxWorker({
    outbox: rt.outbox,
    send: rt.send,
    log: rt.log,
    sentRetentionMs: rt.env.sentRetentionDays * 24 * 3_600_000,
  });
  const configured = Object.fromEntries(
    Object.entries(rt.env.tokens).map(([page, token]) => [page, Boolean(token)]),
  );
  rt.log("worker.started", { outboxDir: rt.env.outboxDir, comercial: Boolean(rt.env.comercialBaseUrl), tokens: configured });
}
