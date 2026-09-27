/**
 * Eventos da P02 no dataLayer (mesmo padrão da Bio). Regras:
 * - nenhum valor digitado entra aqui: só nomes de etapa, códigos de erro e o nome do formulário;
 * - generate_lead só é chamado depois que o servidor confirmou o salvamento;
 * - cada evento tem sua trava contra duplicidade (ver abaixo).
 */
import { FORM_NAME } from "../formulario/config";

export const PAGE_TYPE = "performance_form";

type Event = Record<string, string | number>;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export const STEP_NAMES = { 1: "contact", 2: "whatsapp_confirmation", 3: "qualification", 4: "review" } as const;
export type StepNumber = keyof typeof STEP_NAMES;

const LEAD_KEY = "rco_p02_lead_enviado";

export interface Tracker {
  pageView(): void;
  formStart(): void;
  formStep(step: StepNumber): void;
  formError(errorType: string): void;
  generateLead(submissionId: string): void;
}

/**
 * Travas:
 * - page_view e form_start: uma vez por carregamento da página;
 * - form_step: uma vez por etapa por submissão (voltar e avançar de novo não repete);
 * - generate_lead: uma vez por submission_id, lembrado na sessão (retry, resposta
 *   "duplicate" do servidor e reload não repetem).
 */
export function createTracker(target: Window = window, storage: Storage | null = safeSession(target)): Tracker {
  let viewed = false;
  let started = false;
  const steps = new Set<number>();

  const push = (e: Event) => {
    target.dataLayer = target.dataLayer || [];
    target.dataLayer.push(e);
  };

  return {
    pageView() {
      if (viewed) return;
      viewed = true;
      push({ event: "page_view", page_type: PAGE_TYPE });
    },
    formStart() {
      if (started) return;
      started = true;
      push({ event: "form_start", page_type: PAGE_TYPE, form_name: FORM_NAME });
    },
    formStep(step) {
      if (steps.has(step)) return;
      steps.add(step);
      push({ event: "form_step", page_type: PAGE_TYPE, form_name: FORM_NAME, step, step_name: STEP_NAMES[step] });
    },
    formError(errorType) {
      push({ event: "form_error", page_type: PAGE_TYPE, form_name: FORM_NAME, error_type: errorType });
    },
    generateLead(submissionId) {
      const sent = readSent(storage);
      if (sent.includes(submissionId)) return;
      push({ event: "generate_lead", page_type: PAGE_TYPE, form_name: FORM_NAME });
      try {
        storage?.setItem(LEAD_KEY, JSON.stringify([...sent, submissionId].slice(-20)));
      } catch {
        /* sem storage: a trava em memória do fluxo (status success) ainda impede repetir */
      }
    },
  };
}

function readSent(storage: Storage | null): string[] {
  try {
    return JSON.parse(storage?.getItem(LEAD_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function safeSession(w: Window): Storage | null {
  try {
    return w.sessionStorage;
  } catch {
    return null;
  }
}
