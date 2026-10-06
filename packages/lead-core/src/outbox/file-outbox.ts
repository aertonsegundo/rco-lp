import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { OutboxItem, OutboxStatus } from "./types";

// ============================================================
// Fila de leads em ARQUIVOS: um JSON por lead, em pending/ sent/ failed/.
// Sem dependência nativa e sem banco de terceiro; sobrevive a reinício do
// container se o diretório estiver num volume persistente.
//
// Garantias:
//   - escrita atômica (arquivo temporário + rename): nunca fica meio escrito;
//   - enfileirar é idempotente: o mesmo id nunca entra duas vezes;
//   - trocar de estado é um rename entre pastas.
//
// Limite: pensada para UM processo (um container). Vários processos
// escrevendo o mesmo diretório precisariam de trava; se um dia isso for
// preciso, troque esta classe por SQLite atrás da mesma interface.
// ============================================================

const STATES: OutboxStatus[] = ["pending", "sent", "failed"];
const SAFE_ID = /^[0-9a-fA-F-]{36}$/;

export class FileOutbox {
  readonly dir: string;

  constructor(dir: string) {
    this.dir = path.resolve(dir);
    for (const s of [...STATES, "tmp"]) fs.mkdirSync(path.join(this.dir, s), { recursive: true });
  }

  private file(status: OutboxStatus, id: string): string {
    if (!SAFE_ID.test(id)) throw new Error("id de lead inválido");
    return path.join(this.dir, status, `${id}.json`);
  }

  private writeAtomic(dest: string, item: OutboxItem): void {
    const tmp = path.join(this.dir, "tmp", `${crypto.randomUUID()}.tmp`);
    fs.writeFileSync(tmp, JSON.stringify(item, null, 2), { mode: 0o600 });
    fs.renameSync(tmp, dest);
  }

  /** Em qual estado o id está hoje (sent e failed têm precedência sobre pending). */
  statusOf(id: string): OutboxStatus | null {
    for (const s of ["sent", "failed", "pending"] as const) {
      if (fs.existsSync(this.file(s, id))) return s;
    }
    return null;
  }

  get(id: string): OutboxItem | null {
    const status = this.statusOf(id);
    if (!status) return null;
    try {
      return JSON.parse(fs.readFileSync(this.file(status, id), "utf8")) as OutboxItem;
    } catch {
      return null;
    }
  }

  /**
   * Enfileira como `pending`. Devolve `created:false` se o id já existe em
   * qualquer estado (reenvio, duplo clique, retentativa do navegador).
   */
  enqueue(item: OutboxItem): { created: boolean } {
    if (this.statusOf(item.id)) return { created: false };
    const dest = this.file("pending", item.id);
    const tmp = path.join(this.dir, "tmp", `${crypto.randomUUID()}.tmp`);
    fs.writeFileSync(tmp, JSON.stringify(item, null, 2), { mode: 0o600 });
    try {
      // link() falha com EEXIST se já existir: cria sem sobrescrever, de forma atômica.
      fs.linkSync(tmp, dest);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "EEXIST") return { created: false };
      throw err;
    } finally {
      fs.rmSync(tmp, { force: true });
    }
    return { created: true };
  }

  /** Regrava o item no estado em que ele está (ex.: incrementar tentativas). */
  save(item: OutboxItem): void {
    this.writeAtomic(this.file(item.status, item.id), item);
  }

  /** Grava o item no estado novo e remove do antigo. */
  move(item: OutboxItem, from: OutboxStatus, to: OutboxStatus): void {
    const moved: OutboxItem = { ...item, status: to };
    this.writeAtomic(this.file(to, item.id), moved);
    if (from !== to) fs.rmSync(this.file(from, item.id), { force: true });
  }

  private list(status: OutboxStatus): OutboxItem[] {
    const dir = path.join(this.dir, status);
    const out: OutboxItem[] = [];
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith(".json")) continue;
      try {
        out.push(JSON.parse(fs.readFileSync(path.join(dir, name), "utf8")) as OutboxItem);
      } catch {
        // arquivo corrompido: ignora aqui; counts() e o log de saúde não dependem dele
      }
    }
    return out.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  listPending(): OutboxItem[] {
    return this.list("pending");
  }

  listFailed(): OutboxItem[] {
    return this.list("failed");
  }

  /** Pendentes cujo horário de nova tentativa já chegou. */
  listDue(now: Date, limit = 20): OutboxItem[] {
    return this.listPending()
      .filter((i) => !i.nextAttemptAt || new Date(i.nextAttemptAt).getTime() <= now.getTime())
      .slice(0, limit);
  }

  counts(): { pending: number; sent: number; failed: number; attention: number } {
    const count = (s: OutboxStatus) => fs.readdirSync(path.join(this.dir, s)).filter((n) => n.endsWith(".json")).length;
    const sentWithWarning = this.list("sent").filter((i) => i.crm?.warning).length;
    const failed = count("failed");
    return { pending: count("pending"), sent: count("sent"), failed, attention: failed + sentWithWarning };
  }

  oldestPendingAgeMs(now: Date): number | null {
    const first = this.listPending()[0];
    return first ? now.getTime() - new Date(first.createdAt).getTime() : null;
  }

  /**
   * Consistência depois de queda no meio de um `move`: se o mesmo id está em
   * pending E em sent/failed, o estado final vence e o pending sobra é apagado.
   */
  reconcile(): number {
    let removed = 0;
    for (const item of this.listPending()) {
      if (fs.existsSync(this.file("sent", item.id)) || fs.existsSync(this.file("failed", item.id))) {
        fs.rmSync(this.file("pending", item.id), { force: true });
        removed++;
      }
    }
    for (const name of fs.readdirSync(path.join(this.dir, "tmp"))) {
      fs.rmSync(path.join(this.dir, "tmp", name), { force: true });
    }
    return removed;
  }

  /** Apaga enviados com mais de `olderThanMs` (o arquivo tem dado pessoal). */
  purgeSent(now: Date, olderThanMs: number): number {
    let n = 0;
    for (const item of this.list("sent")) {
      const ref = item.sentAt ?? item.createdAt;
      if (now.getTime() - new Date(ref).getTime() > olderThanMs) {
        fs.rmSync(this.file("sent", item.id), { force: true });
        n++;
      }
    }
    return n;
  }
}
