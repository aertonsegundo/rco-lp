/**
 * Fonte única de conteúdo e configuração da P01 (LP de venda do CRM da RCO).
 *
 * Regra: nada comercial inventado. Todo dado que depende da RCO fica marcado com
 * PENDING_BUSINESS_CONFIGURATION e NÃO aparece na página enquanto estiver vazio.
 * `npm run release-check` lista as pendências e falha se alguma bloquear a venda.
 *
 * Recursos: só o que existe no CRM-RCO (~/Documents/CRM-RCO), com status "entregue"
 * no PLANO-DE-EXECUCAO.md (auditado em 27/09/2026). A seleção do que divulgar é da RCO.
 */

export const PENDING = "PENDING_BUSINESS_CONFIGURATION" as const;

/** Endereço público da LP (canonical/Open Graph). */
export const SITE_URL = "https://crm.rcohub.com/lpcrm/";

/** PENDING_BUSINESS_CONFIGURATION: ID do container GTM. Vazio = GTM não carrega (o dataLayer continua). */
export const GTM_ID = "";

export const links = {
  /**
   * PENDING_BUSINESS_CONFIGURATION: link oficial do acesso de clientes.
   * O login em produção hoje responde em https://crm.rcoacademy.com.br/login, mas o
   * caminho oficial do acesso ainda não foi definido (Mapa: "caminho a definir").
   */
  login: "",
  /** PENDING_BUSINESS_CONFIGURATION: WhatsApp comercial do CRM. */
  whatsapp: "",
};

// ---------------------------------------------------------------------------
// Planos e contratação
// ---------------------------------------------------------------------------

export interface Plan {
  /** Identificador estável (vai para plan_select / begin_checkout / URL do checkout). */
  id: string;
  name: string;
  /** Preço em centavos. null = não definido (o plano não é exibido). */
  priceCents: number | null;
  currency: "BRL";
  /** Ex.: "mês", "ano". */
  period: string;
  features: string[];
  limits: string[];
  addons: string[];
  /** URL do checkout do provedor para este plano. Vazio = sem botão de contratação. */
  checkoutUrl: string;
  highlighted?: boolean;
}

/**
 * PENDING_BUSINESS_CONFIGURATION: planos, preços, periodicidade, limites e adicionais.
 * Não existe nenhum plano cadastrado no CRM-RCO. Enquanto a lista estiver vazia, a seção
 * de planos mostra apenas que os planos estão em definição (sem preço, sem botão).
 */
export const plans: Plan[] = [];

export const checkout = {
  /** PENDING_BUSINESS_CONFIGURATION: provedor de pagamento da assinatura do CRM. */
  provider: "",
  /**
   * PENDING_BUSINESS_CONFIGURATION: endpoint do SERVIDOR que devolve o status do pedido
   * (alimentado pelo webhook/consulta do provedor). Contrato em src/lib/order-status.ts.
   * Sem ele, a página de retorno nunca confirma compra — redirect ≠ pagamento.
   */
  orderStatusEndpoint: "",
};

// ---------------------------------------------------------------------------
// Conteúdo (PENDING_BUSINESS_CONFIGURATION: copy oficial; textos atuais são neutros)
// ---------------------------------------------------------------------------

export const copy = {
  title: "CRM RCO | Atendimento e vendas pelo WhatsApp",
  description:
    "CRM da RCO para organizar atendimento, funil de vendas e origem dos leads no WhatsApp, com integrações de venda e conversões.",
  heroEyebrow: "CRM RCO",
  heroTitle: "Atendimento e vendas pelo WhatsApp, organizados num só lugar",
  heroLead:
    "Para empresas que atendem e vendem pelo WhatsApp: conversas do time, funil de vendas e origem de cada lead no mesmo sistema.",
};

export interface Feature {
  problem: string;
  resource: string;
  benefit: string;
}

/** Problema real → recurso real → benefício prático. Status no PLANO-DE-EXECUCAO.md entre parênteses. */
export const features: Feature[] = [
  {
    // Inbox compartilhada (base wacrm) + CN1 conexão oficial.
    problem: "Conversas espalhadas em vários celulares",
    resource: "Caixa de entrada compartilhada na API oficial do WhatsApp, com responsável por conversa",
    benefit: "O time atende pelo mesmo número e cada conversa tem dono.",
  },
  {
    // AT1 distribuição (✅), AT2 escalonamento (✅), AT4 horário comercial (✅).
    problem: "Lead esperando sem resposta",
    resource: "Distribuição automática de leads, escalonamento por tempo e horário comercial",
    benefit: "Todo novo contato chega a alguém, e o que atrasa é redirecionado.",
  },
  {
    // Funis kanban (base wacrm) + CV1 deal como fonte do faturamento (✅).
    problem: "Não saber em que etapa está cada negociação",
    resource: "Funis de vendas em kanban, com negócios ligados às conversas",
    benefit: "Visão clara do que está em andamento e do que foi ganho.",
  },
  {
    // EN2 régua de follow-up (🟢), automações e fluxos (base wacrm).
    problem: "Contatos esquecidos depois da primeira conversa",
    resource: "Régua de follow-up que para quando o cliente responde, e automações por gatilho",
    benefit: "Retomar contatos sem depender de lembrete manual.",
  },
  {
    // RA1 CTWA (✅), RA2 links UTM (✅), RA3 atribuição (✅), CV2 checkouts (✅), CV4 CAPI (🟢), CV5 Google Ads (🟢), CV6 ROAS (🟢, gasto manual).
    problem: "Não saber qual anúncio trouxe a venda",
    resource:
      "Origem de anúncios Click-to-WhatsApp, links rastreáveis com UTM, vendas da Hotmart, Kiwify e Eduzz e conversões enviadas à Meta e ao Google Ads",
    benefit: "Ligar o investimento em anúncio às vendas registradas.",
  },
  {
    // MR3/MR4 painéis (✅), AC4 auditoria (✅), IA2 classificação (🟢), IA1 insights (✅).
    problem: "Pouca visibilidade sobre o desempenho do time",
    resource: "Painéis por atendente e por setor, log de auditoria e classificação de leads por IA",
    benefit: "Acompanhar o time com dados do próprio CRM.",
  },
];

/** Jornada real de hoje (docs/runbook-provisionamento.md). Muda quando existir contratação online. */
export const onboarding: { title: string; text: string }[] = [
  { title: "Criação da conta", text: "A equipe da RCO cria a conta da sua empresa." },
  { title: "WhatsApp conectado", text: "Seu número é conectado pela API oficial do WhatsApp Business." },
  { title: "Funil e marca", text: "Você define as etapas do funil e aplica o nome e a cor da sua empresa." },
  { title: "Integrações e rastreamento", text: "Links rastreáveis, plataformas de venda e conversões para Meta e Google Ads." },
];

/** Segurança e controle: só o que existe no código do CRM-RCO. */
export const trust: { title: string; text: string }[] = [
  { title: "Papéis e setores", text: "Proprietário, administrador, atendente e visualizador, com separação por setor." },
  { title: "Log de auditoria", text: "Ações relevantes da conta ficam registradas." },
  { title: "Credenciais protegidas", text: "Tokens de integração ficam criptografados no servidor." },
  { title: "API com chaves revogáveis", text: "Integrações próprias com permissões por escopo e limite de uso." },
];

/** FAQ: só respostas confirmadas no produto. Pagamento, cancelamento e suporte: PENDING_BUSINESS_CONFIGURATION. */
export const faq: { q: string; a: string }[] = [
  {
    q: "O CRM usa a API oficial do WhatsApp?",
    a: "Sim. A conexão é feita pela API oficial do WhatsApp Business (Cloud API).",
  },
  {
    q: "Dá para trabalhar com um time inteiro?",
    a: "Sim. A conta tem vários usuários, com papéis (proprietário, administrador, atendente e visualizador) e setores.",
  },
  {
    q: "Integra com plataformas de venda?",
    a: "Sim. Vendas aprovadas na Hotmart, na Kiwify e na Eduzz entram direto no funil.",
  },
  {
    q: "Existe API para integrações próprias?",
    a: "Sim. Há uma API REST com chaves de acesso revogáveis e permissões por escopo, além de webhooks de saída.",
  },
  {
    q: "Como é criado o acesso?",
    a: "Hoje a conta é criada pela equipe da RCO. Depois disso, você conecta o WhatsApp e configura o funil.",
  },
];

/** PENDING_BUSINESS_CONFIGURATION: telas reais do CRM (webp otimizado + alt). Vazio = seção oculta. */
export const screenshots: { src: string; alt: string; width: number; height: number }[] = [];

/** PENDING_BUSINESS_CONFIGURATION: depoimentos AUTORIZADOS. Vazio = seção oculta (nada inventado). */
export const testimonials: { quote: string; author: string; company: string }[] = [];
