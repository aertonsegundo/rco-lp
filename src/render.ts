/**
 * HTML da LP gerado em build a partir de src/config.ts (conteúdo indexável, sem JS para ler).
 * Seção sem dado real some; planos só aparecem completos (ver lib/plans.ts).
 */
import * as cfg from "./config";
import { formatPrice, readyPlans } from "./lib/plans";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Link com destino, ou marcador inativo (sem href) enquanto o destino é pendente — mesmo padrão da P03. */
export function link(label: string, href: string, name: string, position: string, cls: string): string {
  const attrs = `class="${cls}" data-cta="${esc(name)}" data-position="${esc(position)}"`;
  return href
    ? `<a ${attrs} href="${esc(href)}">${esc(label)}</a>`
    : `<a ${attrs} role="link" aria-disabled="true">${esc(label)}</a>`;
}

/** CTA principal: planos quando existirem; senão, os recursos. */
export function primaryCta(c = cfg): { label: string; href: string } {
  return readyPlans(c.plans).length
    ? { label: "Conhecer os planos", href: "#planos" }
    : { label: "Ver os recursos", href: "#recursos" };
}

export function renderHead(c = cfg): string {
  const og = new URL("og-rco.webp", c.SITE_URL).toString();
  const tags = [
    `<title>${esc(c.copy.title)}</title>`,
    `<meta name="description" content="${esc(c.copy.description)}" />`,
    `<link rel="canonical" href="${esc(c.SITE_URL)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:site_name" content="RCO" />`,
    `<meta property="og:title" content="${esc(c.copy.title)}" />`,
    `<meta property="og:description" content="${esc(c.copy.description)}" />`,
    `<meta property="og:url" content="${esc(c.SITE_URL)}" />`,
    `<meta property="og:image" content="${esc(og)}" />`,
  ];
  if (c.GTM_ID) {
    tags.push(
      `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${esc(c.GTM_ID)}');</script>`,
    );
  }
  return tags.join("\n    ");
}

export function renderNav(c = cfg): string {
  const cta = primaryCta(c);
  return `<nav class="nav__links" aria-label="Seções">
          <a href="#recursos">Recursos</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#planos">Planos</a>
          <a href="#duvidas">Dúvidas</a>
        </nav>
        <div class="nav__actions">
          ${link("Entrar no CRM", c.links.login, "entrar_crm", "topo", "nav__login")}
          ${link(cta.label, cta.href, "cta_principal", "topo", "btn btn--primary btn--sm")}
        </div>`;
}

export function renderHero(c = cfg): string {
  const cta = primaryCta(c);
  const shot = c.screenshots[0];
  return `<div class="hero__text">
          <p class="eyebrow">${esc(c.copy.heroEyebrow)}</p>
          <h1 class="hero__title">${esc(c.copy.heroTitle)}</h1>
          <p class="hero__lead">${esc(c.copy.heroLead)}</p>
          <div class="hero__actions">
            ${link(cta.label, cta.href, "cta_principal", "hero", "btn btn--primary")}
            ${c.links.whatsapp ? link("Falar com a RCO", c.links.whatsapp, "whatsapp", "hero", "btn btn--ghost") : ""}
          </div>
        </div>${
          shot
            ? `
        <figure class="hero__shot"><img src="${esc(shot.src)}" alt="${esc(shot.alt)}" width="${shot.width}" height="${shot.height}" fetchpriority="high" /></figure>`
            : ""
        }`;
}

export function renderFeatures(c = cfg): string {
  return c.features
    .map(
      (f) => `<li class="feature">
            <p class="feature__problem">${esc(f.problem)}</p>
            <h3 class="feature__resource">${esc(f.resource)}</h3>
            <p class="feature__benefit">${esc(f.benefit)}</p>
          </li>`,
    )
    .join("\n          ");
}

/** Telas reais: seção inteira some sem screenshot (nada de mockup). */
export function renderDemo(c = cfg): string {
  if (!c.screenshots.length) return "";
  return `<section class="section" id="produto" aria-labelledby="produto-title">
      <div class="container">
        <h2 id="produto-title" class="section__title">O CRM por dentro</h2>
        <div class="shots">${c.screenshots
          .map((s) => `<figure><img src="${esc(s.src)}" alt="${esc(s.alt)}" width="${s.width}" height="${s.height}" loading="lazy" /></figure>`)
          .join("")}</div>
      </div>
    </section>`;
}

export function renderSteps(c = cfg): string {
  return c.onboarding
    .map((s, i) => `<li class="step"><span class="step__n" aria-hidden="true">${i + 1}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></li>`)
    .join("\n          ");
}

export function renderPlans(c = cfg): string {
  const plans = readyPlans(c.plans);
  if (!plans.length) {
    return `<p class="plans__pending" data-pending="${cfg.PENDING}">Os planos e preços do CRM RCO estão em definição.</p>`;
  }
  return `<ul class="plans" role="list">${plans
    .map(
      (p) => `
          <li class="plan${p.highlighted ? " plan--highlight" : ""}">
            <h3 class="plan__name">${esc(p.name)}</h3>
            <p class="plan__price"><strong>${esc(formatPrice(p.priceCents as number, p.currency))}</strong> <span>/ ${esc(p.period)}</span></p>
            ${list("Inclui", p.features)}${list("Limites", p.limits)}${list("Adicionais", p.addons)}
            <a class="btn btn--primary plan__cta" href="${esc(p.checkoutUrl)}" data-plan="${esc(p.id)}">Contratar ${esc(p.name)}</a>
          </li>`,
    )
    .join("")}
        </ul>`;
}

function list(title: string, items: string[]): string {
  if (!items.length) return "";
  return `<div class="plan__list"><p>${esc(title)}</p><ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`;
}

export function renderTrust(c = cfg): string {
  return c.trust.map((t) => `<li><h3>${esc(t.title)}</h3><p>${esc(t.text)}</p></li>`).join("\n          ");
}

export function renderTestimonials(c = cfg): string {
  if (!c.testimonials.length) return "";
  return `<section class="section" aria-labelledby="dep-title">
      <div class="container">
        <h2 id="dep-title" class="section__title">Quem usa</h2>
        <ul class="quotes" role="list">${c.testimonials
          .map((t) => `<li><blockquote>${esc(t.quote)}</blockquote><p>${esc(t.author)} · ${esc(t.company)}</p></li>`)
          .join("")}</ul>
      </div>
    </section>`;
}

export function renderFaq(c = cfg): string {
  return c.faq.map((f) => `<details class="faq__item"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n          ");
}

export function renderClosing(c = cfg): string {
  const cta = primaryCta(c);
  return link(cta.label, cta.href, "cta_principal", "fechamento", "btn btn--light");
}

export function renderFooterLogin(c = cfg): string {
  return link("Já é cliente? Entrar no CRM", c.links.login, "entrar_crm", "rodape", "footer__login");
}

export const slots: Record<string, () => string> = {
  head: () => renderHead(),
  nav: () => renderNav(),
  hero: () => renderHero(),
  features: () => renderFeatures(),
  demo: () => renderDemo(),
  steps: () => renderSteps(),
  plans: () => renderPlans(),
  trust: () => renderTrust(),
  testimonials: () => renderTestimonials(),
  faq: () => renderFaq(),
  closing: () => renderClosing(),
  "footer-login": () => renderFooterLogin(),
};
