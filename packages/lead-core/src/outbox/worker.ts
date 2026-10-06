import { deliverItem, type DeliverDeps, type LogFn } from "./deliver";

export interface WorkerOptions extends DeliverDeps {
  intervalMs?: number;
  /** Quantos itens por rodada (protege o COMERCIAL de uma enxurrada depois de uma queda). */
  batch?: number;
  /** Enviados são apagados depois disso: o arquivo tem nome e telefone. */
  sentRetentionMs?: number;
}

export interface OutboxWorker {
  stop(): void;
  /** Roda uma rodada agora. Existe pra teste e pra comando manual. */
  tick(): Promise<{ delivered: number; due: number }>;
}

const THIRTY_DAYS = 30 * 24 * 3_600_000;

export function startOutboxWorker(opts: WorkerOptions): OutboxWorker {
  const { outbox, intervalMs = 15_000, batch = 20, sentRetentionMs = THIRTY_DAYS, now = () => new Date() } = opts;
  const log: LogFn = opts.log ?? (() => {});
  let running = false;
  let lastPurge = 0;

  async function tick() {
    if (running) return { delivered: 0, due: 0 };
    running = true;
    try {
      const due = outbox.listDue(now(), batch);
      let delivered = 0;
      for (const item of due) {
        const outcome = await deliverItem(opts, item.id);
        if (outcome === "sent") delivered++;
      }
      const t = now().getTime();
      if (t - lastPurge > 3_600_000) {
        lastPurge = t;
        const purged = outbox.purgeSent(now(), sentRetentionMs);
        if (purged) log("outbox.purged", { purged });
      }
      return { delivered, due: due.length };
    } catch (err) {
      log("outbox.tick_error", { error: err instanceof Error ? err.message : String(err) });
      return { delivered: 0, due: 0 };
    } finally {
      running = false;
    }
  }

  const removed = outbox.reconcile();
  if (removed) log("outbox.reconciled", { removed });
  void tick();
  const timer = setInterval(() => void tick(), intervalMs);
  timer.unref?.();
  return { stop: () => clearInterval(timer), tick };
}
