#!/usr/bin/env node
// Ferramenta de operação da fila de leads (arquivos). Uso:
//   npm run outbox -- status
//   npm run outbox -- list [failed|pending|sent]
//   npm run outbox -- show <id> [--full]
//   npm run outbox -- retry <id>      (failed -> pending; o worker do servidor reenvia)
// Diretório: LEAD_OUTBOX_DIR ou apps/web/.data/outbox. Telefone e nome saem
// mascarados, exceto com --full: o arquivo tem dado pessoal (LGPD).
import fs from "node:fs";
import path from "node:path";

const dir = process.env.LEAD_OUTBOX_DIR || path.resolve("apps/web/.data/outbox");
const [cmd = "status", arg, flag] = process.argv.slice(2);
const STATES = ["pending", "failed", "sent"];
const SAFE_ID = /^[0-9a-fA-F-]{36}$/;

if (!fs.existsSync(dir)) {
  console.error(`Fila não encontrada em ${dir}. Defina LEAD_OUTBOX_DIR.`);
  process.exit(1);
}
const read = (state) =>
  fs
    .readdirSync(path.join(dir, state))
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, state, f), "utf8")))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
const mask = (s = "") => (s.length > 4 ? `${"*".repeat(s.length - 4)}${s.slice(-4)}` : s);
const line = (i) => {
  const a = i.payload?.respondent?.answers ?? {};
  return `${i.id}  ${i.page}  ${i.status.padEnd(7)}  tent=${i.attempts}  ${i.createdAt.slice(0, 19)}  ${mask(a.WhatsApp)}${i.lastError ? `  | ${i.lastError}` : ""}`;
};

if (cmd === "status") {
  const all = Object.fromEntries(STATES.map((s) => [s, read(s)]));
  const warn = all.sent.filter((i) => i.crm?.warning);
  console.log(`pendentes: ${all.pending.length} | falhos: ${all.failed.length} | enviados: ${all.sent.length} | enviados com aviso: ${warn.length}`);
  if (all.pending[0]) console.log(`pendente mais antigo: ${all.pending[0].createdAt} (próx. tentativa ${all.pending[0].nextAttemptAt ?? "agora"})`);
  if (all.failed.length + warn.length) console.log("ATENÇÃO: há leads que precisam de alguém. Veja: npm run outbox -- list failed");
} else if (cmd === "list") {
  const state = arg && STATES.includes(arg) ? arg : "failed";
  const items = read(state);
  console.log(items.length ? items.map(line).join("\n") : `(nenhum em ${state})`);
} else if (cmd === "show") {
  if (!arg || !SAFE_ID.test(arg)) { console.error("Informe o id (UUID)."); process.exit(1); }
  const state = STATES.find((s) => fs.existsSync(path.join(dir, s, `${arg}.json`)));
  if (!state) { console.error("Id não encontrado."); process.exit(1); }
  const item = JSON.parse(fs.readFileSync(path.join(dir, state, `${arg}.json`), "utf8"));
  if (flag !== "--full") {
    const a = item.payload.respondent.answers;
    if (a.WhatsApp) a.WhatsApp = mask(a.WhatsApp);
    if (a.Nome) a.Nome = a.Nome.split(" ")[0] + " (…)";
  }
  console.log(JSON.stringify(item, null, 2));
} else if (cmd === "retry") {
  if (!arg || !SAFE_ID.test(arg)) { console.error("Informe o id (UUID)."); process.exit(1); }
  const from = path.join(dir, "failed", `${arg}.json`);
  if (!fs.existsSync(from)) { console.error("Só dá pra reenfileirar um lead em failed."); process.exit(1); }
  const item = JSON.parse(fs.readFileSync(from, "utf8"));
  const next = { ...item, status: "pending", attempts: 0, nextAttemptAt: null, lastError: `reenfileirado à mão (${item.lastError ?? "sem motivo"})` };
  const tmp = path.join(dir, "tmp", `${arg}.retry.tmp`);
  fs.writeFileSync(tmp, JSON.stringify(next, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, path.join(dir, "pending", `${arg}.json`));
  fs.rmSync(from, { force: true });
  console.log("Reenfileirado. O worker do servidor reenvia em até ~15 s (o servidor precisa estar rodando).");
} else {
  console.error("Comandos: status | list [failed|pending|sent] | show <id> [--full] | retry <id>");
  process.exit(1);
}
