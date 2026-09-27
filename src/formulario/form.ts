/**
 * Controlador do formulário em etapas da P02.
 * Etapas: 1 contato → 2 confirmação do WhatsApp → 3 nicho + faturamento → 4 revisão → sucesso.
 * Estados do envio: idle → submitting → success | error (error volta a permitir envio).
 */
import type { Attribution } from "../lib/attribution";
import type { LeadPayload, SendResult } from "../lib/api";
import { clearDraft, saveDraft, type Draft } from "../lib/draft";
import type { StepNumber, Tracker } from "../lib/tracking";
import {
  ERROR_MESSAGES,
  cleanName,
  firstInvalidStep,
  validateStep,
  type ErrorType,
  type Field,
  type FieldError,
} from "../lib/validation";
import { isSuspectName } from "../lib/suspect-name";
import { formatWhatsapp, normalizeWhatsapp } from "../lib/whatsapp";
import {
  CURIOUS_PAGE,
  LANDING_PAGE_VERSION,
  NICHES,
  NICHE_OTHER,
  REVENUE_RANGES,
  SUSPECT_NAMES,
  WHATSAPP_CONFIRMATION_MODE,
  labelOf,
  type WhatsappConfirmationMode,
} from "./config";

export const TOTAL_STEPS = 4;

export type Status = "idle" | "submitting" | "success" | "error";

export interface FormDeps {
  doc: Document;
  storage: Storage | null;
  tracker: Tracker;
  attribution: Attribution;
  draft: Draft;
  send: (payload: LeadPayload) => Promise<SendResult>;
  /** Navegação para a página "Aqui não, curioso" (injetável para teste). */
  redirect?: (url: string) => void;
}

/** Status gravado com o lead para cada modalidade de confirmação. */
export function confirmationStatusFor(mode: WhatsappConfirmationMode): "confirmado_visualmente" {
  if (mode === "visual") return "confirmado_visualmente";
  throw new Error("Confirmação por código ainda não implementada (depende de decisão da RCO).");
}

/** Campo com erro → elemento que recebe o foco. */
const FOCUS_TARGET: Record<Field, string> = {
  full_name: "#full_name",
  whatsapp: "#whatsapp",
  whatsapp_confirmed: "#whatsapp_confirmed",
  niche: "#niche",
  niche_other: "#niche_other",
  revenue_range: 'input[name="revenue_range"]',
};

/** Erro devolvido pelo servidor → etapa e campo da tela. */
const SERVER_FIELD: Record<string, { step: number; field: Field; type: ErrorType }> = {
  invalid_name: { step: 1, field: "full_name", type: "invalid_name" },
  invalid_whatsapp: { step: 1, field: "whatsapp", type: "invalid_whatsapp" },
  whatsapp_not_confirmed: { step: 2, field: "whatsapp_confirmed", type: "whatsapp_not_confirmed" },
  invalid_niche: { step: 3, field: "niche", type: "missing_niche" },
  missing_niche_other: { step: 3, field: "niche_other", type: "missing_niche_other" },
  invalid_revenue_range: { step: 3, field: "revenue_range", type: "missing_revenue_range" },
};

const SUBMIT_MESSAGES = {
  rate_limited: "Recebemos várias tentativas com este número em pouco tempo. Aguarde alguns minutos e tente novamente.",
  generic: "Não conseguimos enviar agora. Suas respostas continuam aqui — tente novamente.",
};

export function mountForm(deps: FormDeps) {
  const { doc, storage, tracker, attribution, send } = deps;
  const draft: Draft = deps.draft;
  let status: Status = "idle";

  const $ = <T extends Element>(sel: string) => doc.querySelector<T>(sel)!;
  const form = $<HTMLFormElement>("#lead-form");
  const inputs = {
    full_name: $<HTMLInputElement>("#full_name"),
    whatsapp: $<HTMLInputElement>("#whatsapp"),
    whatsapp_confirmed: $<HTMLInputElement>("#whatsapp_confirmed"),
    niche: $<HTMLSelectElement>("#niche"),
    niche_other: $<HTMLInputElement>("#niche_other"),
  };
  const honeypot = $<HTMLInputElement>("#website");
  const submitButton = $<HTMLButtonElement>("#submit-button");
  const submitError = $<HTMLElement>("#submit-error");
  const submitStatus = $<HTMLElement>("#submit-status");

  renderOptions();
  fillInputs();
  showStep(draft.step, false);

  // form_start: primeira interação real (digitar, escolher ou tentar avançar), uma única vez.
  form.addEventListener("input", () => tracker.formStart());
  form.addEventListener("change", () => tracker.formStart());

  inputs.full_name.addEventListener("input", () => update({ full_name: inputs.full_name.value }));
  inputs.whatsapp.addEventListener("input", () => {
    const formatted = formatWhatsapp(inputs.whatsapp.value);
    inputs.whatsapp.value = formatted;
    // Número mudou → a confirmação anterior não vale mais.
    if (formatted !== draft.data.whatsapp) update({ whatsapp: formatted, whatsapp_confirmed: false });
  });
  inputs.whatsapp_confirmed.addEventListener("change", () =>
    update({ whatsapp_confirmed: inputs.whatsapp_confirmed.checked }),
  );
  inputs.niche.addEventListener("change", () => {
    update({ niche: inputs.niche.value });
    toggleNicheOther();
  });
  inputs.niche_other.addEventListener("input", () => update({ niche_other: inputs.niche_other.value }));
  form.addEventListener("change", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.name === "revenue_range") update({ revenue_range: t.value });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    tracker.formStart();
    if (draft.step < TOTAL_STEPS) next();
    else void submit();
  });
  for (const b of doc.querySelectorAll<HTMLButtonElement>("[data-back]")) {
    b.addEventListener("click", () => showStep(Math.max(1, draft.step - 1)));
  }
  for (const b of doc.querySelectorAll<HTMLButtonElement>("[data-edit]")) {
    b.addEventListener("click", () => showStep(Number(b.dataset.edit)));
  }

  function update(patch: Partial<Draft["data"]>) {
    Object.assign(draft.data, patch);
    if (patch.whatsapp_confirmed === false) inputs.whatsapp_confirmed.checked = false;
    for (const key of Object.keys(patch) as Field[]) clearError(key);
    saveDraft(storage, draft);
  }

  function renderOptions() {
    for (const o of NICHES) {
      const opt = doc.createElement("option");
      opt.value = o.value;
      opt.textContent = o.label;
      inputs.niche.append(opt);
    }
    const box = $<HTMLElement>("#revenue-options");
    for (const o of REVENUE_RANGES) {
      const id = `revenue-${o.value}`;
      const wrap = doc.createElement("div");
      wrap.className = "radio";
      const input = doc.createElement("input");
      Object.assign(input, { type: "radio", name: "revenue_range", id, value: o.value });
      const label = doc.createElement("label");
      label.htmlFor = id;
      label.textContent = o.label;
      wrap.append(input, label);
      box.append(wrap);
    }
  }

  function fillInputs() {
    const d = draft.data;
    inputs.full_name.value = d.full_name;
    inputs.whatsapp.value = d.whatsapp;
    inputs.whatsapp_confirmed.checked = d.whatsapp_confirmed;
    inputs.niche.value = d.niche;
    inputs.niche_other.value = d.niche_other;
    for (const r of doc.querySelectorAll<HTMLInputElement>('input[name="revenue_range"]')) {
      r.checked = r.value === d.revenue_range;
    }
    toggleNicheOther();
  }

  function toggleNicheOther() {
    $<HTMLElement>("#niche_other-field").hidden = inputs.niche.value !== NICHE_OTHER;
  }

  function showStep(step: number, focus = true) {
    draft.step = step;
    saveDraft(storage, draft);
    form.dataset.currentStep = String(step); // só visual: o CSS pinta os rótulos do progresso
    // Só visual: primeiro nome na frase de conversa das etapas ("Obrigado, Maria.").
    const firstName = cleanName(draft.data.full_name).split(" ")[0] ?? "";
    for (const el of doc.querySelectorAll<HTMLElement>("[data-first-name]")) el.textContent = firstName;
    for (const s of doc.querySelectorAll<HTMLElement>("[data-step]")) {
      s.hidden = Number(s.dataset.step) !== step;
    }
    $<HTMLElement>("#progress-text").textContent = `Etapa ${step} de ${TOTAL_STEPS}`;
    $<HTMLElement>("#progress-fill").style.width = `${(step / TOTAL_STEPS) * 100}%`;
    if (step === 2) $<HTMLElement>("#confirm-number").textContent = draft.data.whatsapp;
    if (step === 4) renderReview();
    if (focus) $<HTMLElement>(`#s${step}-title`).focus();
  }

  function renderReview() {
    const d = draft.data;
    const niche = d.niche === NICHE_OTHER ? `Outro: ${d.niche_other.trim()}` : labelOf(NICHES, d.niche);
    const values: Record<string, string> = {
      full_name: cleanName(d.full_name),
      whatsapp: d.whatsapp,
      niche,
      revenue_range: labelOf(REVENUE_RANGES, d.revenue_range),
    };
    for (const dd of doc.querySelectorAll<HTMLElement>("[data-review]")) {
      dd.textContent = values[dd.dataset.review!] ?? "";
    }
  }

  /** Nome de curioso (Teste, Fulano, aaaa…): nada é salvo, rascunho apagado, vai para a página própria. */
  function blockCurious(): boolean {
    if (!isSuspectName(draft.data.full_name, SUSPECT_NAMES)) return false;
    tracker.formError("suspect_name");
    clearDraft(storage);
    (deps.redirect ?? ((url: string) => window.location.assign(url)))(CURIOUS_PAGE);
    return true;
  }

  function next() {
    const errors = validateStep(draft.step, draft.data);
    if (errors.length) return showErrors(errors);
    if (draft.step === 1 && blockCurious()) return;
    tracker.formStep(draft.step as StepNumber);
    showStep(draft.step + 1);
  }

  function showErrors(errors: FieldError[]) {
    for (const err of errors) {
      const box = $<HTMLElement>(`#${err.field}-error`);
      box.textContent = ERROR_MESSAGES[err.type];
      box.hidden = false;
      setInvalid(err.field, true);
      tracker.formError(err.type);
    }
    doc.querySelector<HTMLElement>(FOCUS_TARGET[errors[0].field])?.focus();
  }

  function clearError(field: Field) {
    const box = doc.querySelector<HTMLElement>(`#${field}-error`);
    if (box) {
      box.hidden = true;
      box.textContent = "";
    }
    setInvalid(field, false);
  }

  function setInvalid(field: Field, invalid: boolean) {
    const els =
      field === "revenue_range"
        ? [...doc.querySelectorAll<HTMLElement>('input[name="revenue_range"]')]
        : [doc.querySelector<HTMLElement>(FOCUS_TARGET[field])];
    for (const el of els) {
      if (!el) continue;
      if (invalid) el.setAttribute("aria-invalid", "true");
      else el.removeAttribute("aria-invalid");
    }
  }

  function setStatus(next: Status) {
    status = next;
    const busy = next === "submitting";
    submitButton.disabled = busy;
    submitButton.setAttribute("aria-busy", String(busy));
    submitButton.textContent = busy ? "Enviando…" : next === "error" ? "Tentar novamente" : "Enviar";
    submitStatus.textContent = busy ? "Enviando seus dados…" : "";
    for (const b of doc.querySelectorAll<HTMLButtonElement>("[data-step='4'] [data-back], [data-edit]")) {
      b.disabled = busy;
    }
  }

  function showSubmitError(message: string) {
    submitError.textContent = message;
    submitError.hidden = false;
  }

  async function submit() {
    if (status === "submitting" || status === "success") return;

    // A revisão revalida tudo: rascunho antigo ou edição fora de ordem não passa.
    const invalidStep = firstInvalidStep(draft.data);
    if (invalidStep) {
      showStep(invalidStep);
      return showErrors(validateStep(invalidStep, draft.data));
    }
    if (blockCurious()) return;

    tracker.formStep(4);
    submitError.hidden = true;
    setStatus("submitting");

    const d = draft.data;
    const result = await send({
      ...attribution,
      submission_id: draft.submissionId,
      full_name: cleanName(d.full_name),
      whatsapp: normalizeWhatsapp(d.whatsapp),
      whatsapp_confirmation_status: confirmationStatusFor(WHATSAPP_CONFIRMATION_MODE),
      niche: d.niche,
      niche_other: d.niche === NICHE_OTHER ? d.niche_other.trim() : null,
      revenue_range: d.revenue_range,
      landing_page_version: LANDING_PAGE_VERSION,
      website: honeypot.value,
    });

    if (result.kind === "saved") {
      // Único ponto do código que dispara generate_lead: servidor confirmou o salvamento.
      tracker.generateLead(draft.submissionId);
      clearDraft(storage);
      setStatus("success");
      form.hidden = true;
      const success = $<HTMLElement>("#success");
      success.hidden = false;
      $<HTMLElement>("#success-title").focus();
      return;
    }

    setStatus("error");
    if (result.kind === "rejected") {
      tracker.formError(`server_${result.error}`);
      const mapped = SERVER_FIELD[result.error];
      if (mapped) {
        showStep(mapped.step);
        return showErrors([{ field: mapped.field, type: mapped.type }]);
      }
      return showSubmitError(result.error === "rate_limited" ? SUBMIT_MESSAGES.rate_limited : SUBMIT_MESSAGES.generic);
    }
    tracker.formError(`submit_${result.reason}`);
    showSubmitError(SUBMIT_MESSAGES.generic);
  }

  return {
    get status() {
      return status;
    },
    get step() {
      return draft.step;
    },
  };
}
