import type { PageConfig } from "@/content/pages";
import { LeadForm } from "./LeadForm";
import { PageHero } from "./PageHero";
import { PageSections, SiteFooter } from "./sections";
import { DarkGradientLayers } from "./ui/dark-gradient-bg";

/**
 * As duas páginas (P04 e P05) têm a mesma montagem; o que muda é o conteúdo
 * (`content/pages.ts`): hero → formulário → seções na ordem da copy → rodapé.
 * A P04 tem vídeo no hero (`page.video`), a P05 não. Sem cabeçalho/menu.
 */
export function LandingPage({ page }: { page: PageConfig }) {
  const formId = "formulario";

  return (
    <main>
      <PageHero page={page} formId={formId} />

      {/* Do formulário até o fim das seções, um fundo só e contínuo (só o
          hero e o rodapé ficam de fora). `overflow` num ancestral de
          `position: sticky` quebraria o sticky: as camadas do fundo não usam. */}
      <div className="relative">
        <div aria-hidden="true" className="absolute inset-0">
          <DarkGradientLayers />
          {/* Esmaece o topo do fundo no tom do hero, sem corte seco. */}
          <div className="absolute inset-x-0 top-0 h-40" style={{ background: "linear-gradient(to bottom, var(--bg), transparent)" }} />
        </div>
        <div className="relative">
          <section id={formId} className="mx-auto max-w-xl scroll-mt-6 px-5 pt-12 pb-12 sm:pt-16 sm:pb-20">
            <LeadForm page={page.id} copy={page.form} />
          </section>

          <PageSections sections={page.sections} page={page.id} formId={formId} />
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
