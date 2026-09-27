import { describe, expect, it } from "vitest";
import * as cfg from "./config";
import { renderDemo, renderFooterLogin, renderHero, renderNav, renderPlans, renderTestimonials, primaryCta } from "./render";

const ready: cfg.Plan = {
  id: "pro", name: "Pro", priceCents: 19900, currency: "BRL", period: "mês",
  features: ["Recurso A"], limits: [], addons: [], checkoutUrl: "https://pay.example.com/p/abc",
};
const withPlans = (plans: cfg.Plan[]) => ({ ...cfg, plans });

describe("nada comercial inventado", () => {
  it("config atual: sem planos, sem preço, sem botão de contratar — só o aviso de definição", () => {
    const html = renderPlans();
    expect(html).toContain("em definição");
    expect(html).toContain("PENDING_BUSINESS_CONFIGURATION");
    expect(html).not.toMatch(/R\$|data-plan|Contratar/);
  });

  it("plano completo aparece com preço, período e botão; incompleto some", () => {
    const html = renderPlans(withPlans([ready, { ...ready, id: "x", name: "X", priceCents: null }]));
    expect(html).toContain("R$ 199,00");
    expect(html).toContain("/ mês");
    expect(html).toContain('data-plan="pro"');
    expect(html).not.toContain('data-plan="x"');
  });

  it("CTA principal leva aos planos só quando eles existem", () => {
    expect(primaryCta()).toEqual({ label: "Ver os recursos", href: "#recursos" });
    expect(primaryCta(withPlans([ready]))).toEqual({ label: "Conhecer os planos", href: "#planos" });
  });

  it("sem telas reais e sem depoimentos, as seções não existem", () => {
    expect(renderDemo()).toBe("");
    expect(renderTestimonials()).toBe("");
    expect(renderHero()).not.toContain("<img");
  });

  it("acesso de clientes é separado e, enquanto pendente, não é link navegável", () => {
    for (const html of [renderNav(), renderFooterLogin()]) {
      expect(html).toMatch(/data-cta="entrar_crm"[^>]*role="link" aria-disabled="true"|role="link" aria-disabled="true"[^>]*/);
      expect(html).not.toMatch(/data-cta="entrar_crm"[^>]*href=/);
    }
    expect(renderNav()).toContain("Entrar no CRM");
  });
});
