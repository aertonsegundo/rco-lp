// Baixa o vídeo do hero direto do ar (só leitura, GET) para public/video/. Fica fora do Git por tamanho.
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const url = "https://crm.rcohub.com.br/video/crm-rco-lancamento.mp4";
const dest = new URL("../public/video/crm-rco-lancamento.mp4", import.meta.url);
if (existsSync(dest)) {
  console.log("vídeo já está em public/video/");
} else {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`falha ao baixar ${url}: HTTP ${res.status}`);
  await mkdir(new URL("../public/video/", import.meta.url), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  console.log("vídeo salvo em public/video/crm-rco-lancamento.mp4");
}
