import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FileOutbox } from "./file-outbox";
import { DEFAULT_BACKOFF_MS, deliverItem } from "./deliver";
import { startOutboxWorker } from "./worker";
import type { OutboxItem } from "./types";
import type { CrmResult } from "../respondi";

let dir: string;
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "rco-outbox-"));
});
afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
});

function item(over: Partial<OutboxItem> = {}): OutboxItem {
  return {
    id: crypto.randomUUID(),
    page: "P04",
    status: "pending",
    payload: {
      form: { form_id: "lp-p04", form_name: "LP P04" },
      respondent: { respondent_id: "x", status: "completed", answers: { WhatsApp: "5511999998888" } },
    },
    createdAt: "2026-09-27T12:00:00.000Z",
    attempts: 0,
    lastAttemptAt: null,
    nextAttemptAt: null,
    lastError: null,
    sentAt: null,
    crm: null,
    ...over,
  };
}
const T0 = new Date("2026-09-27T12:00:00.000Z");
const sent: CrmResult = { kind: "sent", httpStatus: 200, duplicate: false, body: { ok: true } };
const retry = (reason = "fora do ar", retryAfterMs?: number): CrmResult => ({ kind: "retry", reason, retryAfterMs });

describe("FileOutbox", () => {
  it("enfileira uma vez; o mesmo id de novo não duplica (qualquer estado)", () => {
    const ob = new FileOutbox(dir);
    const it1 = item();
    expect(ob.enqueue(it1)).toEqual({ created: true });
    expect(ob.enqueue(it1)).toEqual({ created: false });
    ob.move(it1, "pending", "sent");
    expect(ob.enqueue(it1)).toEqual({ created: false });
    expect(ob.statusOf(it1.id)).toBe("sent");
  });

  it("recusa ids que não são UUID (nada de caminho fabricado)", () => {
    const ob = new FileOutbox(dir);
    expect(() => ob.enqueue(item({ id: "../../etc/passwd" }))).toThrow();
  });

  it("os arquivos ficam com permissão restrita (têm dado pessoal)", () => {
    const ob = new FileOutbox(dir);
    const i = item();
    ob.enqueue(i);
    const mode = fs.statSync(path.join(dir, "pending", `${i.id}.json`)).mode & 0o777;
    expect(mode).toBe(0o600);
  });

  it("não deixa arquivo temporário para trás", () => {
    const ob = new FileOutbox(dir);
    ob.enqueue(item());
    ob.enqueue(item());
    expect(fs.readdirSync(path.join(dir, "tmp"))).toEqual([]);
  });

  it("sobrevive a reinício: outra instância no mesmo diretório vê o pendente", () => {
    const i = item();
    new FileOutbox(dir).enqueue(i);
    const depois = new FileOutbox(dir);
    expect(depois.listPending().map((x) => x.id)).toEqual([i.id]);
    expect(depois.get(i.id)?.payload.respondent.answers.WhatsApp).toBe("5511999998888");
  });

  it("listDue respeita nextAttemptAt e ordena por criação", () => {
    const ob = new FileOutbox(dir);
    const a = item({ createdAt: "2026-09-27T12:00:02.000Z" });
    const b = item({ createdAt: "2026-09-27T12:00:01.000Z" });
    const futuro = item({ createdAt: "2026-09-27T12:00:00.000Z", nextAttemptAt: "2026-09-27T13:00:00.000Z" });
    [a, b, futuro].forEach((x) => ob.enqueue(x));
    expect(ob.listDue(new Date("2026-09-27T12:30:00.000Z")).map((x) => x.id)).toEqual([b.id, a.id]);
    expect(ob.listDue(new Date("2026-09-27T13:00:00.000Z"))).toHaveLength(3);
  });

  it("reconcile: se caiu no meio de um move, o estado final vence e o pending sobra some", () => {
    const ob = new FileOutbox(dir);
    const i = item();
    ob.enqueue(i);
    fs.copyFileSync(path.join(dir, "pending", `${i.id}.json`), path.join(dir, "sent", `${i.id}.json`));
    expect(ob.reconcile()).toBe(1);
    expect(fs.existsSync(path.join(dir, "pending", `${i.id}.json`))).toBe(false);
    expect(ob.statusOf(i.id)).toBe("sent");
  });

  it("purgeSent apaga só enviados antigos", () => {
    const ob = new FileOutbox(dir);
    const velho = item({ status: "sent", sentAt: "2026-01-01T00:00:00.000Z" });
    const novo = item({ status: "sent", sentAt: "2026-09-27T11:00:00.000Z" });
    ob.enqueue({ ...velho, status: "pending" });
    ob.enqueue({ ...novo, status: "pending" });
    ob.move(velho, "pending", "sent");
    ob.move(novo, "pending", "sent");
    expect(ob.purgeSent(T0, 30 * 24 * 3_600_000)).toBe(1);
    expect(ob.statusOf(velho.id)).toBeNull();
    expect(ob.statusOf(novo.id)).toBe("sent");
  });

  it("counts inclui em 'attention' os falhos e os enviados com aviso", () => {
    const ob = new FileOutbox(dir);
    const ok = item();
    const warn = item();
    const bad = item();
    const pend = item();
    for (const x of [ok, warn, bad, pend]) ob.enqueue(x);
    ob.move({ ...ok, crm: { duplicate: false } }, "pending", "sent");
    ob.move({ ...warn, crm: { warning: "processing_error" } }, "pending", "sent");
    ob.move({ ...bad, lastError: "x" }, "pending", "failed");
    expect(ob.counts()).toEqual({ pending: 1, sent: 2, failed: 1, attention: 2 });
  });
});

describe("deliverItem", () => {
  it("sucesso: vai para sent, com tentativas e horário", async () => {
    const ob = new FileOutbox(dir);
    const i = item();
    ob.enqueue(i);
    const out = await deliverItem({ outbox: ob, send: async () => sent, now: () => T0 }, i.id);
    expect(out).toBe("sent");
    const got = ob.get(i.id)!;
    expect(got).toMatchObject({ status: "sent", attempts: 1, sentAt: T0.toISOString(), lastError: null, nextAttemptAt: null });
  });

  it("falha definitiva vai direto para failed, sem retentar", async () => {
    const ob = new FileOutbox(dir);
    const i = item();
    ob.enqueue(i);
    const send = vi.fn(async (): Promise<CrmResult> => ({ kind: "failed", reason: "token da integração não existe (404)", httpStatus: 404 }));
    expect(await deliverItem({ outbox: ob, send, now: () => T0 }, i.id)).toBe("failed");
    expect(ob.get(i.id)).toMatchObject({ status: "failed", attempts: 1, lastError: expect.stringContaining("404") });
    expect(await deliverItem({ outbox: ob, send, now: () => T0 }, i.id)).toBe("skipped");
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("falha passageira agenda a próxima tentativa pelo backoff e continua pending", async () => {
    const ob = new FileOutbox(dir);
    const i = item();
    ob.enqueue(i);
    await deliverItem({ outbox: ob, send: async () => retry(), now: () => T0 }, i.id);
    const got = ob.get(i.id)!;
    expect(got.status).toBe("pending");
    expect(got.attempts).toBe(1);
    expect(got.nextAttemptAt).toBe(new Date(T0.getTime() + DEFAULT_BACKOFF_MS[0]!).toISOString());
    expect(got.lastError).toBe("fora do ar");
  });

  it("Retry-After maior que o backoff prevalece", async () => {
    const ob = new FileOutbox(dir);
    const i = item();
    ob.enqueue(i);
    await deliverItem({ outbox: ob, send: async () => retry("429", 10 * 60_000), now: () => T0 }, i.id);
    expect(ob.get(i.id)!.nextAttemptAt).toBe(new Date(T0.getTime() + 10 * 60_000).toISOString());
  });

  it("esgota as tentativas e vai para failed (pede olhar humano)", async () => {
    const ob = new FileOutbox(dir);
    const i = item();
    ob.enqueue(i);
    const backoff = [1, 2];
    for (let n = 0; n < 3; n++) {
      await deliverItem({ outbox: ob, send: async () => retry("fora do ar"), now: () => T0, backoffMs: backoff }, i.id);
    }
    expect(ob.get(i.id)).toMatchObject({ status: "failed", attempts: 3, lastError: expect.stringContaining("esgotou 3 tentativas") });
  });

  it("nunca envia o mesmo lead duas vezes ao mesmo tempo (entrega imediata + worker)", async () => {
    const ob = new FileOutbox(dir);
    const i = item();
    ob.enqueue(i);
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const send = vi.fn(async (): Promise<CrmResult> => {
      await gate;
      return sent;
    });
    const p1 = deliverItem({ outbox: ob, send, now: () => T0 }, i.id);
    const p2 = await deliverItem({ outbox: ob, send, now: () => T0 }, i.id);
    expect(p2).toBe("skipped");
    release();
    expect(await p1).toBe("sent");
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("exceção inesperada no envio vira retry, não perde o lead", async () => {
    const ob = new FileOutbox(dir);
    const i = item();
    ob.enqueue(i);
    const out = await deliverItem({ outbox: ob, send: async () => { throw new Error("boom"); }, now: () => T0 }, i.id);
    expect(out).toBe("retry");
    expect(ob.get(i.id)!.status).toBe("pending");
  });

  it("enviado com aviso fica em sent, marcado", async () => {
    const ob = new FileOutbox(dir);
    const i = item();
    ob.enqueue(i);
    await deliverItem({ outbox: ob, send: async () => ({ ...sent, kind: "sent", warning: "processing_error" }) as CrmResult, now: () => T0 }, i.id);
    expect(ob.get(i.id)).toMatchObject({ status: "sent", crm: { warning: "processing_error" } });
  });
});

describe("startOutboxWorker: COMERCIAL fora do ar e volta", () => {
  it("retenta quando o horário chega e entrega uma vez só", async () => {
    const ob = new FileOutbox(dir);
    const i = item();
    ob.enqueue(i);
    let clock = T0.getTime();
    let up = false;
    const send = vi.fn(async (): Promise<CrmResult> => (up ? sent : retry("COMERCIAL indisponível (HTTP 503)")));
    const worker = startOutboxWorker({ outbox: ob, send, now: () => new Date(clock), intervalMs: 3_600_000 });
    await worker.tick();
    expect(ob.get(i.id)).toMatchObject({ status: "pending", attempts: expect.any(Number) });
    const antes = ob.get(i.id)!.attempts;

    // Antes do horário: nada acontece.
    clock += 5_000;
    await worker.tick();
    expect(ob.get(i.id)!.attempts).toBe(antes);

    // COMERCIAL volta; passa o backoff: entrega.
    up = true;
    clock += 10 * 60_000;
    const r = await worker.tick();
    expect(r.delivered).toBe(1);
    expect(ob.get(i.id)!.status).toBe("sent");

    // Depois de enviado, nunca mais é enviado.
    const calls = send.mock.calls.length;
    clock += 24 * 3_600_000;
    await worker.tick();
    expect(send.mock.calls.length).toBe(calls);
    worker.stop();
  });

  it("depois de um reinício do processo, retoma o que ficou pendente", async () => {
    const i = item();
    new FileOutbox(dir).enqueue(i);
    const ob2 = new FileOutbox(dir);
    const send = vi.fn(async () => sent);
    const worker = startOutboxWorker({ outbox: ob2, send, now: () => T0, intervalMs: 3_600_000 });
    await worker.tick();
    expect(ob2.get(i.id)!.status).toBe("sent");
    worker.stop();
  });

  it("limita o tamanho da rodada (não despeja tudo de uma vez no COMERCIAL)", async () => {
    const ob = new FileOutbox(dir);
    for (let n = 0; n < 5; n++) ob.enqueue(item({ createdAt: `2026-09-27T12:00:0${n}.000Z` }));
    const send = vi.fn(async () => sent);
    const worker = startOutboxWorker({ outbox: ob, send, now: () => T0, intervalMs: 3_600_000, batch: 2 });
    await new Promise((r) => setTimeout(r, 20));
    const before = send.mock.calls.length;
    expect(before).toBeLessThanOrEqual(2);
    worker.stop();
  });
});
