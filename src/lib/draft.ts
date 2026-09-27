/**
 * Rascunho na sessão do próprio navegador: sobrevive a reload e mantém o mesmo
 * submission_id até o servidor confirmar o salvamento. Nunca vai para URL nem analytics.
 * Apagado assim que o lead é salvo.
 */
import { emptyForm, type FormData } from "./validation";

const KEY = "rco_p02_rascunho";

export interface Draft {
  submissionId: string;
  step: number;
  data: FormData;
}

export function newSubmissionId(): string {
  return crypto.randomUUID();
}

export function loadDraft(storage: Storage | null): Draft {
  try {
    const raw = storage?.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as Partial<Draft>;
      if (typeof d.submissionId === "string" && d.data) {
        return {
          submissionId: d.submissionId,
          step: typeof d.step === "number" && d.step >= 1 && d.step <= 4 ? d.step : 1,
          data: { ...emptyForm(), ...d.data },
        };
      }
    }
  } catch {
    /* rascunho corrompido: começa do zero */
  }
  return { submissionId: newSubmissionId(), step: 1, data: emptyForm() };
}

export function saveDraft(storage: Storage | null, draft: Draft): void {
  try {
    storage?.setItem(KEY, JSON.stringify(draft));
  } catch {
    /* sem storage: o formulário funciona, só não sobrevive a reload */
  }
}

export function clearDraft(storage: Storage | null): void {
  try {
    storage?.removeItem(KEY);
  } catch {
    /* nada a fazer */
  }
}
