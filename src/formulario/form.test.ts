import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LeadPayload, SendResult } from "../lib/api";
import { captureAttribution } from "../lib/attribution";
import { loadDraft } from "../lib/draft";
import { createTracker } from "../lib/tracking";
import { confirmationStatusFor, mountForm } from "./form";

const HTML = readFileSync(resolve(process.cwd(), "formulario/index.html"), "utf8");
const BODY = HTML.slice(HTML.indexOf("<body>") + 6, HTML.indexOf("</body>"));
const ENTRY = "https://lp.rcohub.com/formulario/?utm_source=instagram&utm_medium=bio&utm_campaign=performance&utm_content=story&utm_term=crm&gclid=G1&fbclid=ABC&foo=bar";
const PII = ["Maria", "Silva", "99876", "5562998765432", "servicos", "ate_10k", "Pet"];

type Sender = ReturnType<typeof vi.fn<(p: LeadPayload) => Promise<SendResult>>>;

function setup(send: Sender, href = ENTRY) {
  document.body.innerHTML = BODY;
  const tracker = createTracker(window, sessionStorage);
  tracker.pageView();
  const ctl = mountForm({
    doc: document,
    storage: sessionStorage,
    tracker,
    attribution: captureAttribution(href, "https://bio.rcohub.com/", sessionStorage),
    draft: loadDraft(sessionStorage),
    send,
  });
  return ctl;
}

const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!;
const visibleStep = () => Number(document.querySelector<HTMLElement>("[data-step]:not([hidden])")?.dataset.step);
const type = (sel: string, value: string) => {
  const el = $<HTMLInputElement>(sel);
  el.value = value;
  el.dispatchEvent(new Event("input", { bubbles: true }));
};
const choose = (sel: string) => {
  const el = $<HTMLInputElement>(sel);
  el.checked = true;
  el.dispatchEvent(new Event("change", { bubbles: true }));
};
const select = (value: string) => {
  const el = $<HTMLSelectElement>("#niche");
  el.value = value;
  el.dispatchEvent(new Event("change", { bubbles: true }));
};
const submitStep = () => $<HTMLButtonElement>("[data-step]:not([hidden]) button[type=submit]").click();
const events = () => (window.dataLayer ?? []) as Record<string, unknown>[];
const named = (n: string) => events().filter((e) => e.event === n);
const flush = () => new Promise((r) => setTimeout(r, 0));

function fillToReview() {
  type("#full_name", "  Maria   da Silva ");
  type("#whatsapp", "62998765432");
  submitStep();
  choose("#whatsapp_confirmed");
  submitStep();
  select("servicos");
  choose("#revenue-ate_10k");
  submitStep();
}

const saved = (): Sender => vi.fn(async () => ({ kind: "saved", leadId: "L1", duplicate: false }) as SendResult);

beforeEach(() => {
  sessionStorage.clear();
  window.dataLayer = [];
});

describe("P02 — navegação", () => {
  it("avança pelas 4 etapas com progresso e foco no título de cada etapa", () => {
    setup(saved());
    expect($("#progress-text").textContent).toBe("Etapa 1 de 4");
    fillToReview();
    expect(visibleStep()).toBe(4);
    expect($("#progress-text").textContent).toBe("Etapa 4 de 4");
    expect(document.activeElement).toBe($("#s4-title"));
  });

  it("voltar não apaga respostas; máscara aplicada no WhatsApp", () => {
    setup(saved());
    fillToReview();
    $<HTMLButtonElement>("[data-step='4'] [data-back]").click();
    expect(visibleStep()).toBe(3);
    expect($<HTMLSelectElement>("#niche").value).toBe("servicos");
    expect($<HTMLInputElement>("#revenue-ate_10k").checked).toBe(true);
    $<HTMLButtonElement>("[data-step='3'] [data-back]").click();
    $<HTMLButtonElement>("[data-step='2'] [data-back]").click();
    expect(visibleStep()).toBe(1);
    expect($<HTMLInputElement>("#full_name").value).toBe("  Maria   da Silva ");
    expect($<HTMLInputElement>("#whatsapp").value).toBe("(62) 99876-5432");
  });

  it("reload mantém etapa, respostas e o mesmo submission_id", () => {
    setup(saved());
    fillToReview();
    const before = loadDraft(sessionStorage);
    setup(saved()); // "recarrega" a página
    expect(visibleStep()).toBe(4);
    expect(loadDraft(sessionStorage).submissionId).toBe(before.submissionId);
    expect($("[data-review='full_name']").textContent).toBe("Maria da Silva");
  });
});

describe("P02 — validação na tela", () => {
  it("erros perto do campo, aria-invalid e foco no primeiro inválido", () => {
    setup(saved());
    submitStep();
    expect(visibleStep()).toBe(1);
    expect($("#full_name-error").hidden).toBe(false);
    expect($("#full_name-error").textContent).toBe("Informe seu nome completo.");
    expect($("#whatsapp-error").textContent).toBe("Informe seu WhatsApp com DDD.");
    expect($("#full_name").getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe($("#full_name"));
    expect(named("form_error").map((e) => e.error_type)).toEqual(["missing_name", "missing_whatsapp"]);
  });

  it("corrigir o campo limpa o erro", () => {
    setup(saved());
    submitStep();
    type("#full_name", "Maria");
    expect($("#full_name-error").hidden).toBe(true);
    expect($("#full_name").hasAttribute("aria-invalid")).toBe(false);
  });

  it("WhatsApp inválido é barrado", () => {
    setup(saved());
    type("#full_name", "Maria");
    type("#whatsapp", "(62) 1234");
    submitStep();
    expect(visibleStep()).toBe(1);
    expect(document.activeElement).toBe($("#whatsapp"));
    expect(named("form_error").at(-1)?.error_type).toBe("invalid_whatsapp");
  });

  it("confirmação: mostra o número digitado; sem marcar não avança; trocar o número desfaz a confirmação", () => {
    setup(saved());
    type("#full_name", "Maria");
    type("#whatsapp", "62998765432");
    submitStep();
    expect($("#confirm-number").textContent).toBe("(62) 99876-5432");
    submitStep();
    expect(visibleStep()).toBe(2);
    expect(named("form_error").at(-1)?.error_type).toBe("whatsapp_not_confirmed");
    choose("#whatsapp_confirmed");
    $<HTMLButtonElement>("[data-step='2'] [data-back]").click();
    type("#whatsapp", "11912345678");
    submitStep();
    expect($<HTMLInputElement>("#whatsapp_confirmed").checked).toBe(false);
    expect($("#confirm-number").textContent).toBe("(11) 91234-5678");
  });

  it("modalidade configurada: visual grava 'confirmado_visualmente'; código não existe ainda", () => {
    expect(confirmationStatusFor("visual")).toBe("confirmado_visualmente");
    expect(() => confirmationStatusFor("codigo")).toThrow(/não implementada/);
  });

  it("nicho e faturamento obrigatórios; Outro abre campo de texto obrigatório", () => {
    setup(saved());
    type("#full_name", "Maria");
    type("#whatsapp", "62998765432");
    submitStep();
    choose("#whatsapp_confirmed");
    submitStep();
    submitStep();
    expect(named("form_error").slice(-2).map((e) => e.error_type)).toEqual(["missing_niche", "missing_revenue_range"]);
    expect([...$<HTMLSelectElement>("#niche").options].map((o) => o.value)).toContain("outro");
    expect($("#niche_other-field").hidden).toBe(true);
    select("outro");
    expect($("#niche_other-field").hidden).toBe(false);
    choose("#revenue-ate_10k");
    submitStep();
    expect(visibleStep()).toBe(3);
    expect(document.activeElement).toBe($("#niche_other"));
    type("#niche_other", "Pet shop");
    submitStep();
    expect($("[data-review='niche']").textContent).toBe("Outro: Pet shop");
  });
});

describe("P02 — revisão", () => {
  it("mostra os 4 dados e Editar volta à etapa certa sem perder o resto", () => {
    setup(saved());
    fillToReview();
    const review = Object.fromEntries(
      [...document.querySelectorAll<HTMLElement>("[data-review]")].map((d) => [d.dataset.review, d.textContent]),
    );
    expect(review).toEqual({
      full_name: "Maria da Silva",
      whatsapp: "(62) 99876-5432",
      niche: "Serviços",
      revenue_range: "Até R$ 10 mil",
    });
    $<HTMLButtonElement>("[aria-label='Editar faturamento']").click();
    expect(visibleStep()).toBe(3);
    expect($<HTMLInputElement>("#full_name").value).toBe("  Maria   da Silva ");
    choose("#revenue-10k_50k");
    submitStep();
    expect($("[data-review='revenue_range']").textContent).toBe("De R$ 10 mil a R$ 50 mil");
    $<HTMLButtonElement>("[aria-label='Editar WhatsApp']").click();
    expect(visibleStep()).toBe(1);
  });
});

describe("P02 — envio", () => {
  it("loading, sem envio duplicado por clique duplo, sucesso só após salvar", async () => {
    let resolve!: (r: SendResult) => void;
    const send: Sender = vi.fn(() => new Promise<SendResult>((r) => (resolve = r)));
    const ctl = setup(send);
    fillToReview();
    submitStep();
    submitStep();
    $<HTMLButtonElement>("#submit-button").click();
    expect(send).toHaveBeenCalledTimes(1);
    expect(ctl.status).toBe("submitting");
    expect($<HTMLButtonElement>("#submit-button").disabled).toBe(true);
    expect($("#submit-button").textContent).toBe("Enviando…");
    expect($("#success").hidden).toBe(true);
    expect(named("generate_lead")).toHaveLength(0); // clique não é lead

    resolve({ kind: "saved", leadId: "L1", duplicate: false });
    await flush();
    expect(ctl.status).toBe("success");
    expect($("#success").hidden).toBe(false);
    expect($("#lead-form").hidden).toBe(true);
    expect(document.activeElement).toBe($("#success-title"));
    expect(named("generate_lead")).toEqual([{ event: "generate_lead", page_type: "performance_form", form_name: "performance" }]);
    expect(sessionStorage.getItem("rco_p02_rascunho")).toBeNull();
  });

  it("payload: dados normalizados, submission_id, origem completa e nada arbitrário", async () => {
    const send = saved();
    setup(send);
    fillToReview();
    submitStep();
    await flush();
    const p = send.mock.calls[0][0];
    expect(p).toMatchObject({
      full_name: "Maria da Silva",
      whatsapp: "5562998765432",
      whatsapp_confirmation_status: "confirmado_visualmente",
      niche: "servicos",
      niche_other: null,
      revenue_range: "ate_10k",
      landing_page_version: "p02-formulario-v1",
      utm_source: "instagram",
      utm_medium: "bio",
      utm_campaign: "performance",
      utm_content: "story",
      utm_term: "crm",
      gclid: "G1",
      fbclid: "ABC",
      source_page: "https://bio.rcohub.com/",
      conversion_page: "https://lp.rcohub.com/formulario/",
      website: "",
    });
    expect(p.submission_id).toMatch(/^[0-9a-f-]{36}$/);
    expect(JSON.stringify(p)).not.toContain("foo");
  });

  it("erro: mensagem, respostas preservadas, retry com o MESMO submission_id, sem falso sucesso", async () => {
    const send: Sender = vi
      .fn<(p: LeadPayload) => Promise<SendResult>>()
      .mockResolvedValueOnce({ kind: "failed", reason: "timeout" })
      .mockResolvedValueOnce({ kind: "saved", leadId: "L1", duplicate: true });
    const ctl = setup(send);
    fillToReview();
    submitStep();
    await flush();
    expect(ctl.status).toBe("error");
    expect($("#submit-error").hidden).toBe(false);
    expect($("#submit-error").getAttribute("role")).toBe("alert");
    expect($("#submit-button").textContent).toBe("Tentar novamente");
    expect($("#success").hidden).toBe(true);
    expect(named("generate_lead")).toHaveLength(0);
    expect(named("form_error").at(-1)?.error_type).toBe("submit_timeout");
    expect($("[data-review='full_name']").textContent).toBe("Maria da Silva");

    submitStep(); // retry
    await flush();
    expect(send).toHaveBeenCalledTimes(2);
    expect(send.mock.calls[1][0].submission_id).toBe(send.mock.calls[0][0].submission_id);
    expect(ctl.status).toBe("success");
    // O 1º envio tinha salvo (resposta perdida): o servidor responde duplicate, e o lead conta uma vez.
    expect(named("generate_lead")).toHaveLength(1);
  });

  it("rejeição do servidor volta ao campo certo, sem sucesso", async () => {
    const send: Sender = vi.fn(async () => ({ kind: "rejected", error: "invalid_whatsapp", field: "whatsapp" }) as SendResult);
    const ctl = setup(send);
    fillToReview();
    submitStep();
    await flush();
    expect(ctl.status).toBe("error");
    expect(visibleStep()).toBe(1);
    expect($("#whatsapp-error").hidden).toBe(false);
    expect(named("generate_lead")).toHaveLength(0);
  });

  it("rate limit mostra mensagem própria e permite tentar depois", async () => {
    setup(vi.fn(async () => ({ kind: "rejected", error: "rate_limited" }) as SendResult));
    fillToReview();
    submitStep();
    await flush();
    expect($("#submit-error").textContent).toContain("Aguarde alguns minutos");
    expect($<HTMLButtonElement>("#submit-button").disabled).toBe(false);
  });

  it("rascunho adulterado não passa da revisão sem revalidar", async () => {
    const send = saved();
    sessionStorage.setItem(
      "rco_p02_rascunho",
      JSON.stringify({ submissionId: crypto.randomUUID(), step: 4, data: { full_name: "", whatsapp: "x" } }),
    );
    setup(send);
    submitStep();
    await flush();
    expect(send).not.toHaveBeenCalled();
    expect(visibleStep()).toBe(1);
  });
});

describe("P02 — tracking", () => {
  it("sequência completa sem duplicidade e sem nenhuma PII no dataLayer", async () => {
    setup(saved());
    type("#full_name", "Maria da Silva");
    type("#whatsapp", "62998765432");
    submitStep();
    $<HTMLButtonElement>("[data-step='2'] [data-back]").click();
    submitStep(); // passa de novo pela etapa 1
    choose("#whatsapp_confirmed");
    submitStep();
    select("outro");
    type("#niche_other", "Pet shop");
    choose("#revenue-ate_10k");
    submitStep();
    submitStep();
    await flush();
    expect(events().map((e) => e.event)).toEqual([
      "page_view",
      "form_start",
      "form_step",
      "form_step",
      "form_step",
      "form_step",
      "generate_lead",
    ]);
    expect(named("form_step").map((e) => e.step_name)).toEqual([
      "contact",
      "whatsapp_confirmation",
      "qualification",
      "review",
    ]);
    const dump = JSON.stringify(events());
    for (const pii of PII) expect(dump).not.toContain(pii);
  });

  it("tentar avançar vazio também é interação: form_start vem antes do form_error", () => {
    setup(saved());
    submitStep();
    expect(events().map((e) => e.event)).toEqual(["page_view", "form_start", "form_error", "form_error"]);
  });

  it("form_start só com interação real (não no carregamento)", () => {
    setup(saved());
    expect(named("form_start")).toHaveLength(0);
    type("#full_name", "M");
    type("#full_name", "Ma");
    expect(named("form_start")).toHaveLength(1);
  });
});
