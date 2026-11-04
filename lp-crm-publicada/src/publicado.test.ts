// @vitest-environment node
/**
 * Trava do rastreamento: o JS de comportamento e de rastreamento (GTM/dataLayer, eventos, captura de
 * utm_*, gclid e fbclid, planos e checkout) é o MESMO arquivo publicado em crm.rcohub.com.br,
 * copiado byte a byte em 04/11/2026. Se algum hash mudar, alguém mexeu no que não podia.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const PUBLICADO: Record<string, string> = {
  "lp-CSfBEdHU.js": "e5e72e4014b4214e89e782e9b9b2db4aa313d6905a958080c237a29707e975a0",
  "tracking-CS8A2dUk.js": "c40377244dd883e7aef57f88d7243a2a3c53f4bffe3533b2a92f1b19b680567e",
  "obrigado-SfFqEXMi.js": "43f3d64fff3428cdc31327e50841e578cfeb8673586470f6cf37e9130296ffa3",
};

const sha = (p: string) => createHash("sha256").update(readFileSync(new URL(p, import.meta.url))).digest("hex");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

describe("JS publicado", () => {
  for (const [file, hash] of Object.entries(PUBLICADO)) {
    it(`${file} igual ao do ar`, () => expect(sha(`../public/assets/${file}`)).toBe(hash));
  }
});

describe("rastreamento no HTML", () => {
  it("GTM com o mesmo ID, no head e no noscript", () => {
    expect(html.match(/GTM-P9XNXV2B/g)).toHaveLength(2);
  });
  it("CTAs medidos continuam com os mesmos data-cta / data-plan", () => {
    const ctas = [...html.matchAll(/data-cta="([^"]+)" data-position="([^"]+)"/g)].map((m) => `${m[1]}@${m[2]}`);
    const plans = [...html.matchAll(/data-plan="([^"]+)"/g)].map((m) => m[1]);
    expect({ ctas, plans }).toMatchSnapshot();
  });
});
