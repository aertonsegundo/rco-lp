// ============================================================
// MARCA OPALÊ da P01 (crm.rcohub.com.br). Tudo que é marca e não é cor fica aqui: nome da agência,
// nome do produto, logo, favicon, imagem de compartilhamento, rodapé e o método OPALA.
// Cores, fonte e forma: tokens em src/style.css (bloco "TOKENS OPALÊ", igual ao das outras LPs).
// Trocar marca ou copy = editar este arquivo; o vite.config.ts injeta no HTML.
// ============================================================

/**
 * NOME DO PRODUTO vendido nesta página. PENDENTE DE DECISÃO DO PHILIP: o produto se chama
 * "CRM RCO" (é o nome que aparece no vídeo do hero e nas telas do sistema). A Opalê entra só como
 * marca da agência; o nome do produto continua o atual até a decisão. Trocar aqui troca em todos
 * os pontos do HTML ({{produto}}: título da aba, compartilhamento, rótulo do fluxo, vídeo).
 */
export const PRODUTO = "CRM RCO";

/**
 * COPY PROVISÓRIA: textos marcados `provisorio: true` são do time, para montar a página.
 * O texto final do método OPALA vem do Luis.
 */
export const OPALE = {
  name: "Opalê",
  tagline: "Do bruto ao brilhante.",
  description: "Agência de Marketing e Propaganda.",
  /** Logo oficial reconstruído do vetor do manual (logo horizontal: símbolo + "Opalê" + frase). */
  logo: { src: "/brand/opale/logo-horizontal@2x.webp", width: 688, height: 298, alt: "Opalê, do bruto ao brilhante" },
  simbolo: { src: "/brand/opale/simbolo.webp", width: 354, height: 512 },
  favicon: { png32: "/brand/opale/favicon-32.png", apple: "/brand/opale/apple-touch-icon-180.png" },
  /** Imagem de compartilhamento 1200x630 (scripts/og.html). */
  ogImage: "/brand/opale/og-crm.png",
  /** Cor da barra do navegador no celular (= --opale-noite). */
  themeColor: "#0d0d1a",
  footer: "© Opalê. Todos os direitos reservados.",
} as const;

export const SITE_URL = "https://crm.rcohub.com.br/";

export const PAGINA = {
  /** Título da aba e do compartilhamento ({{produto}} vira PRODUTO). */
  title: "{{produto}} | WhatsApp, vendas, IA e rastreamento",
  description:
    "Organize leads, acompanhe vendedores, use IA no pré e pós-venda e descubra quais anúncios estão trazendo vendas para sua empresa.",
  obrigadoTitle: "{{produto}} | Status do pagamento",
} as const;

/**
 * Método OPALA. Letras, nomes e ORDEM são fixos (documento "Transição das landing pages pra
 * Opalê", v1.0): O Orgânico, P Posicionamento, A Audiência, L Lead, A Aumento de venda.
 * `text` e os títulos são PROVISÓRIOS e iguais aos das outras LPs (landingpages, content/brand.ts).
 */
export const OPALA = {
  provisorio: true,
  eyebrow: "Método OPALA",
  heading: "Do bruto ao brilhante, em cinco etapas",
  subtitle: "Cada letra é uma etapa do trabalho da Opalê com o seu negócio, do primeiro conteúdo até a venda fechada.",
  items: [
    { letter: "O", name: "Orgânico", text: "Conteúdo e presença que fazem o seu negócio ser encontrado sem depender só de anúncio." },
    { letter: "P", name: "Posicionamento", text: "Clareza sobre o que você vende, para quem vende e por que o cliente deve escolher você." },
    { letter: "A", name: "Audiência", text: "As pessoas certas chegando por tráfego pago e conteúdo, no lugar de cliques soltos." },
    { letter: "L", name: "Lead", text: "Contatos que chegam pelo WhatsApp já organizados e qualificados dentro do CRM." },
    { letter: "A", name: "Aumento de venda", text: "Atendimento rápido e acompanhamento até o fechamento, medido do clique até a venda." },
  ],
} as const;

/** General Sans pela API da Fontshare (licença ITF FFL: os arquivos não entram no repositório público). */
export const OPALE_FONT_CSS = "https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap";
