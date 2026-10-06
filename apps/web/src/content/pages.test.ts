import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PAGES, type PageId } from "./pages";

// Garante que o texto das páginas é EXATAMENTE o da copy v2 (docs/copy-v2.md),
// nos dois sentidos: nada inventado em pages.ts e nada da copy esquecido.

const md = readFileSync(path.resolve(import.meta.dirname, "../../../../docs/copy-v2.md"), "utf8");
const [, p04Md = "", p05Md = ""] = md.split(/^# LP 0[45]$/m);

const SKIP = [/^#{1,2} /, /^\[VÍDEO\]$/, /^Campos:/, /^Erros:/, /^---$/, /^©/];
const PREFIXES = /^(### |Título \(H1\): |Título: |Descrição: |Sobretítulo: |Texto: |Botão: |Enquanto envia: |Depois de enviar: |\[Botão\] |P: |R: |• |\d+\. )/;

function copyLines(section: string): string[] {
  return section
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !SKIP.some((re) => re.test(l)))
    .map((l) => l.replace(PREFIXES, "").replace(/^\*\*(.*)\*\*$/, "$1"));
}

function collect(node: unknown, out: Set<string>): void {
  if (typeof node === "string") out.add(node);
  else if (Array.isArray(node)) node.forEach((n) => collect(n, out));
  else if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (["id", "kind", "t", "variant", "path", "formId", "formName", "source"].includes(k)) continue;
      collect(v, out);
    }
  }
}

describe.each<[PageId, string]>([
  ["P04", p04Md],
  ["P05", p05Md],
])("copy v2 de %s", (id, section) => {
  const page = PAGES[id];
  const used = new Set<string>();
  collect(
    { title: page.title, description: page.description, hero: page.hero, form: page.form, sections: page.sections },
    used,
  );
  // "Perguntas frequentes" é o título da seção (na copy é só o rótulo "## PERGUNTAS FREQUENTES").
  const expected = new Set([...copyLines(section), "Perguntas frequentes"]);

  it("todo texto da página existe na copy", () => {
    const invented = [...used].filter((t) => !expected.has(t));
    expect(invented).toEqual([]);
  });

  it("toda linha da copy aparece na página", () => {
    const missing = [...expected].filter((t) => !used.has(t));
    expect(missing).toEqual([]);
  });

  it("sem travessão", () => {
    expect([...used].filter((t) => /[–—]/.test(t))).toEqual([]);
  });
});
