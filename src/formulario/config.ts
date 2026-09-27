/**
 * Fonte única de configuração da P02 (Formulário de Performance).
 * Tudo marcado com PENDENTE depende de decisão da RCO — os valores atuais são
 * provisórios e NÃO são regra oficial.
 */

export const FORM_NAME = "performance";

/** Versão gravada junto de cada lead (landing_page_version). Trocar a cada mudança relevante do formulário. */
export const LANDING_PAGE_VERSION = "p02-formulario-v1";

/**
 * Supabase oficial da RCO (https://sb.rcoacademy.com.br), via .env.production (fora do Git; modelo em .env.example).
 * A chave anônima é pública por natureza; ela só alcança a função de captação (ver a migration 001).
 * Sem essas variáveis o envio falha com erro visível — nunca finge sucesso.
 */
export const api = {
  url: (import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/+$/, ""),
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
  rpc: "capturar_lead_performance_rco",
  timeoutMs: 15000,
};

/**
 * PENDENTE: método definitivo de confirmação do WhatsApp.
 * - "visual": TEMPORÁRIO. A pessoa confere o número digitado. Não prova posse do número.
 * - "codigo": código enviado ao WhatsApp. Exige provedor, custo, expiração, reenvio e limite
 *   de tentativas — NÃO implementado; precisa de autorização e de fluxo no servidor.
 */
export type WhatsappConfirmationMode = "visual" | "codigo";
export const WHATSAPP_CONFIRMATION_MODE: WhatsappConfirmationMode = "visual";

export interface Option {
  /** Valor gravado no banco: minúsculas, dígitos e _ (a função do banco exige esse formato). */
  value: string;
  label: string;
}

/** Valor do nicho que abre o campo de texto livre. */
export const NICHE_OTHER = "outro";

/** PENDENTE: lista final de nichos/segmentos. Provisória. "Outro" é obrigatório e fica por último. */
export const NICHES: Option[] = [
  { value: "servicos", label: "Serviços" },
  { value: "comercio_varejo", label: "Comércio / varejo" },
  { value: "saude", label: "Saúde" },
  { value: "educacao", label: "Educação" },
  { value: "alimentacao", label: "Alimentação" },
  { value: "industria", label: "Indústria" },
  { value: NICHE_OTHER, label: "Outro" },
];

/** PENDENTE: faixas finais de faturamento mensal. Provisórias; nenhuma faixa bloqueia o envio. */
export const REVENUE_RANGES: Option[] = [
  { value: "ate_10k", label: "Até R$ 10 mil" },
  { value: "10k_50k", label: "De R$ 10 mil a R$ 50 mil" },
  { value: "50k_100k", label: "De R$ 50 mil a R$ 100 mil" },
  { value: "100k_500k", label: "De R$ 100 mil a R$ 500 mil" },
  { value: "acima_500k", label: "Acima de R$ 500 mil" },
];

export const labelOf = (options: Option[], value: string): string =>
  options.find((o) => o.value === value)?.label ?? value;

/**
 * Nomes "de curioso": quem se identifica assim vai para a página "Aqui não, curioso" e nada é salvo.
 * Comparação por palavra inteira, sem acento. Além desta lista: test/teste/testando e variações,
 * uma letra repetida (aaaa), palavra sem vogal com 4+ letras (sdfg) e nome com número.
 * A RCO pode acrescentar termos aqui.
 */
export const SUSPECT_NAMES: readonly string[] = [
  "fulano", "fulana", "ciclano", "ciclana", "sicrano", "sicrana", "beltrano", "beltrana",
  "asdf", "asdfg", "asdfgh", "qwerty", "qwert", "abc", "abcd", "xxx", "xpto",
  "lorem", "ipsum", "fake", "bot", "anonimo", "anonima", "ninguem", "curioso", "curiosa",
  "nada", "nome", "sobrenome", "exemplo",
];

/** Página para onde vai quem se identifica como curioso (relativa a /formulario/). */
export const CURIOUS_PAGE = "./curioso/";
