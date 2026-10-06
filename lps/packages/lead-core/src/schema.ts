import { z } from "zod";
import { cleanText } from "./tracking";
import { normalizeBrPhone } from "./phone";

// ============================================================
// Validação do formulário. O MESMO schema roda no browser (react-hook-form)
// e no servidor (/api/lead): o servidor revalida tudo.
//
// Os limites de valor (páginas, nichos, faixas de faturamento) vêm da
// configuração do app (createLeadSchema), não daqui: o conteúdo final ainda
// não existe e vai mudar sem tocar neste pacote.
// ============================================================

export interface LeadSchemaConfig {
  /** Ids de página aceitos, ex.: ["P04", "P05"]. */
  pages: readonly [string, ...string[]];
  /** Valores aceitos em "Nicho" (o que a pessoa pode escolher). */
  nichos: readonly [string, ...string[]];
  /** Valores aceitos em "Faturamento". */
  faturamentos: readonly [string, ...string[]];
}

const text = (max: number) =>
  z
    .string()
    .transform((v) => cleanText(v, max));

/** Heurística anti-spam bem básica: nome não é lugar de link nem de tag. */
const parecesSpam = (v: string) => /https?:|www\.|<|>|@/i.test(v);

/** Campos que a pessoa preenche. Compartilhado entre o formulário e o envio. */
function personFields(cfg: LeadSchemaConfig) {
  return {
    name: text(120)
      .refine((v) => v.length >= 2, "Informe seu nome.")
      .refine((v) => !parecesSpam(v), "Informe apenas seu nome."),
    whatsapp: z
      .string()
      .refine(
        (v) => normalizeBrPhone(v) !== null,
        "Informe um WhatsApp válido: DDD + número com 9 dígitos.",
      ),
    email: text(254).refine((v) => z.email().safeParse(v).success, "Informe um email válido."),
    nicho: z.enum(cfg.nichos, { error: "Escolha uma opção." }),
    faturamento: z.enum(cfg.faturamentos, { error: "Escolha uma opção." }),
    /** Honeypot: campo escondido. Humano deixa vazio; robô costuma preencher. */
    website: z.string().max(200).optional(),
  };
}

/** Schema do que chega em POST /api/lead. O servidor revalida tudo com ele. */
export function createLeadSchema(cfg: LeadSchemaConfig) {
  return z.object({
    respondentId: z.uuid({ error: "Identificador de envio inválido." }),
    page: z.enum(cfg.pages, { error: "Página inválida." }),
    ...personFields(cfg),
    tracking: z.unknown().optional(),
  });
}

/** Schema do formulário no browser (sem id de envio nem página: quem injeta é o código). */
export function createLeadFormSchema(cfg: LeadSchemaConfig) {
  return z.object(personFields(cfg));
}

export type LeadSchema = ReturnType<typeof createLeadSchema>;
export type LeadInput = z.infer<LeadSchema>;
export type LeadFormSchema = ReturnType<typeof createLeadFormSchema>;

/** Erros por campo, no formato que o formulário consome. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
