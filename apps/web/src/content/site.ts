// ============================================================
// Configuração do SITE que não é segredo e muda com o conteúdo final.
// Fica em código (não em variável de ambiente) de propósito: o EasyPanel
// repassa toda variável como build-arg, e valores embutidos no build
// (metadata, NEXT_PUBLIC_*) só valem se o Dockerfile declarar cada um. Uma
// constante versionada não tem esse risco e o histórico do git mostra quando mudou.
// ============================================================

/** Enquanto o texto for de exemplo, NÃO indexar nos buscadores. Mude para true junto do conteúdo final. */
export const ALLOW_INDEXING = false;

/** Faixa "Conteúdo de exemplo" no canto da tela. Desligar junto do conteúdo final. */
export const SHOW_PLACEHOLDER_BADGE = true;

/** Container do Google Tag Manager. Vazio = GTM não é carregado. Constante (não env) de propósito: ver o topo do arquivo. */
export const GTM_ID = "GTM-P9XNXV2B";

/** DEIXE VAZIO. O Pixel do Meta é configurado dentro do GTM (docs/gtm-eventos.md); preencher aqui o carregaria duas vezes. */
export const META_PIXEL_ID = "";

/**
 * Logo do hero. O mesmo arquivo do COMERCIAL-RCO/CRM (`public/rco-icon.png`
 * lá, copiado pra cá como `public/rco-logo.png` — troque o arquivo se o CRM
 * atualizar o logo). Ver `components/Logo.tsx`.
 */
export const LOGO = { src: "/rco-logo.png", alt: "RCO", width: 256, height: 245 };
