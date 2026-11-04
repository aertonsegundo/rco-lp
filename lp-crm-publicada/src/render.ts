/**
 * Gera, em tempo de build (vite.config.ts), os trechos de marca do HTML a partir de src/brand.ts:
 * <!-- opale:head -->, <!-- opale:opala -->, <!-- opale:footer -->, <!-- opale:status-logo --> e o
 * marcador {{produto}}. O resto do HTML é o publicado; nada aqui toca rastreamento.
 */
import { OPALA, OPALE, OPALE_FONT_CSS, PAGINA, PRODUTO, SITE_URL } from "./brand.ts";

export const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const produto = (s: string) => s.replaceAll("{{produto}}", PRODUTO);

function fontAndIcons(): string[] {
  return [
    `<meta name="theme-color" content="${OPALE.themeColor}" />`,
    `<link rel="icon" type="image/png" sizes="32x32" href="${OPALE.favicon.png32}" />`,
    `<link rel="apple-touch-icon" href="${OPALE.favicon.apple}" />`,
    `<link rel="preconnect" href="https://api.fontshare.com" />`,
    `<link rel="preconnect" href="https://cdn.fontshare.com" crossorigin />`,
    `<link rel="stylesheet" href="${OPALE_FONT_CSS}" />`,
  ];
}

export function renderHead(): string {
  const title = produto(PAGINA.title);
  const og = new URL(OPALE.ogImage, SITE_URL).toString();
  return [
    ...fontAndIcons(),
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(PAGINA.description)}" />`,
    `<meta property="og:site_name" content="${esc(OPALE.name)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(PAGINA.description)}" />`,
    `<meta property="og:image" content="${esc(og)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(OPALE.name)}" />`,
  ].join("\n    ");
}

export function renderObrigadoHead(): string {
  return [...fontAndIcons(), `<title>${esc(produto(PAGINA.obrigadoTitle))}</title>`].join("\n    ");
}

/** Seção do método OPALA: cinco cartões com a letra centralizada, sempre na ordem do config. */
export function renderOpala(): string {
  const cards = OPALA.items
    .map(
      (it) =>
        `<li class="opala-card"><span class="opala-card__letter" aria-hidden="true">${esc(it.letter)}</span>` +
        `<h3 class="opala-card__name"><span class="sr-only">${esc(it.letter)} de </span>${esc(it.name)}</h3>` +
        `<p class="opala-card__text">${esc(it.text)}</p></li>`,
    )
    .join("\n          ");
  return `<!-- COPY PROVISÓRIA (src/brand.ts, OPALA): texto final do Luis. -->
      <section class="section opala" id="metodo-opala" aria-labelledby="opala-title">
        <div class="container">
          <p class="eyebrow">${esc(OPALA.eyebrow)}</p>
          <h2 id="opala-title" class="section__title">${esc(OPALA.heading)}</h2>
          <p class="opala__sub">${esc(OPALA.subtitle)}</p>
          <ol class="opala__list" role="list">
          ${cards}
          </ol>
        </div>
      </section>`;
}

export function renderFooterBrand(): string {
  const { logo } = OPALE;
  return `<span class="footer__brand"><img class="footer__logo" src="${logo.src}" alt="${esc(logo.alt)}" width="${logo.width}" height="${logo.height}" loading="lazy" /><span>${esc(OPALE.footer)}</span></span>`;
}

export function renderStatusLogo(): string {
  const { simbolo, name } = OPALE;
  return `<img src="${simbolo.src}" alt="${esc(name)}" width="${simbolo.width}" height="${simbolo.height}" />`;
}

export const slots: Record<string, () => string> = {
  head: renderHead,
  "obrigado-head": renderObrigadoHead,
  opala: renderOpala,
  footer: renderFooterBrand,
  "status-logo": renderStatusLogo,
};

export function transformHtml(html: string): string {
  return produto(html.replace(/<!-- opale:([\w-]+) -->/g, (tag, slot: string) => (slots[slot] ? slots[slot]() : tag)));
}
