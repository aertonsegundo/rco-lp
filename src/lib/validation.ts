import { NICHE_OTHER } from "../formulario/config";
import { whatsappProblem } from "./whatsapp";

export interface FormData {
  full_name: string;
  whatsapp: string;
  whatsapp_confirmed: boolean;
  niche: string;
  niche_other: string;
  revenue_range: string;
}

export const emptyForm = (): FormData => ({
  full_name: "",
  whatsapp: "",
  whatsapp_confirmed: false,
  niche: "",
  niche_other: "",
  revenue_range: "",
});

export type Field = "full_name" | "whatsapp" | "whatsapp_confirmed" | "niche" | "niche_other" | "revenue_range";

/** Código técnico do erro: é o que vai para o form_error (nunca o valor digitado). */
export type ErrorType =
  | "missing_name"
  | "invalid_name"
  | "missing_whatsapp"
  | "invalid_whatsapp"
  | "whatsapp_not_confirmed"
  | "missing_niche"
  | "missing_niche_other"
  | "missing_revenue_range";

export interface FieldError {
  field: Field;
  type: ErrorType;
}

export const ERROR_MESSAGES: Record<ErrorType, string> = {
  missing_name: "Informe seu nome completo.",
  invalid_name: "Informe um nome com pelo menos 2 letras (máximo de 120 caracteres).",
  missing_whatsapp: "Informe seu WhatsApp com DDD.",
  invalid_whatsapp: "Número inválido. Use DDD + número, por exemplo (62) 99876-5432.",
  whatsapp_not_confirmed: "Confira o número e marque a confirmação para continuar.",
  missing_niche: "Escolha o segmento da sua empresa.",
  missing_niche_other: "Conte qual é o segmento da sua empresa.",
  missing_revenue_range: "Escolha a faixa de faturamento mensal.",
};

export const cleanName = (v: string) => v.trim().replace(/\s+/g, " ");

/** Etapas com campos: 1 contato, 2 confirmação do WhatsApp, 3 nicho + faturamento. Ordem = ordem na tela. */
export function validateStep(step: number, data: FormData): FieldError[] {
  const errors: FieldError[] = [];
  if (step === 1) {
    const name = cleanName(data.full_name);
    if (!name) errors.push({ field: "full_name", type: "missing_name" });
    else if (name.length < 2 || name.length > 120) errors.push({ field: "full_name", type: "invalid_name" });
    const wa = whatsappProblem(data.whatsapp);
    if (wa === "required") errors.push({ field: "whatsapp", type: "missing_whatsapp" });
    else if (wa === "invalid") errors.push({ field: "whatsapp", type: "invalid_whatsapp" });
  }
  if (step === 2 && !data.whatsapp_confirmed) {
    errors.push({ field: "whatsapp_confirmed", type: "whatsapp_not_confirmed" });
  }
  if (step === 3) {
    if (!data.niche) errors.push({ field: "niche", type: "missing_niche" });
    else if (data.niche === NICHE_OTHER && !data.niche_other.trim())
      errors.push({ field: "niche_other", type: "missing_niche_other" });
    if (!data.revenue_range) errors.push({ field: "revenue_range", type: "missing_revenue_range" });
  }
  return errors;
}

/** Tudo que precisa estar certo antes do envio (a revisão revalida as etapas anteriores). */
export function firstInvalidStep(data: FormData): number | null {
  for (const step of [1, 2, 3]) if (validateStep(step, data).length) return step;
  return null;
}
