import type { PageConfig } from "@/content/pages";
import { Faq } from "./Faq";
import { HeroCta } from "./HeroCta";
import { LeadForm } from "./LeadForm";
import { OrbitHero } from "./OrbitHero";
import { Benefits, SiteFooter, Steps } from "./sections";
import { DarkGradientLayers } from "./ui/dark-gradient-bg";
import { FeaturesWithPanel } from "./ui/features-with-panel";
import { ScrollGallery } from "./ui/scroll-gallery";

/**
 * Compõe a P05 nos 6 blocos originais. A P04 tem o próprio fluxo, mais
 * enxuto e com vídeo (`LandingPageP04.tsx`) — as duas pararam de
 * compartilhar este componente porque os blocos que fazem sentido pra cada
 * uma divergiram (ver o comentário no topo de `LandingPageP04.tsx`).
 *   01 Abertura                      → OrbitHero (logos das ferramentas girando atrás do texto,
 *      sem botão — pedido explícito do usuário, o botão do hero saiu daqui, ver bloco 08)
 *   02 Formulário                    → LeadForm (pedido explícito do usuário: logo depois do
 *      hero, sem esperar o resto da página; o Faq continua no fim, não voltou a ficar junto)
 *   03 Problemas que a RCO resolve   → ScrollGallery (dores, galeria presa na tela)
 *   04 O que está incluído           → Benefits (o diagrama do fluxo, IncludedFlow)
 *   05 Como funciona                 → Steps (do contato ao início do trabalho)
 *   06 Confiança e apresentação      → FeaturesWithPanel ("Por que escolher o CRM RCO?")
 *   07 Dúvidas                       → Faq
 *   08 Chamada final                 → HeroCta (o mesmo botão que antes ficava no hero,
 *      pedido explícito do usuário pra vir só depois do FAQ; rola de volta pro formulário
 *      do bloco 02, que já está preenchido/visível bem mais acima)
 *
 * Sem cabeçalho/menu.
 */
export function LandingPage({ page }: { page: PageConfig }) {
  const { hero } = page;
  const formId = "formulario";

  return (
    <main>
      {/* ---------- 01 Abertura ---------- */}
      <OrbitHero eyebrow={hero.eyebrow} title={hero.title} subtitle={hero.subtitle} />

      {/* ---------- 02 a 06: um fundo só, contínuo ---------- */}
      {/* Da seção 02 até o formulário (06), um fundo só, do tamanho de tudo
          isso junto — só o hero (01) e o rodapé ficam de fora. Um fundo
          decorativo por seção (como era antes) criava uma emenda visível
          entre elas, e o realce mais forte do gradiente (ancorado no canto
          superior) caía sempre bem no topo de cada uma — inclusive logo
          depois do hero, a transição mais brusca de todas. `position:
          relative` aqui não quebra nada (só `overflow` num ancestral de um
          elemento `sticky` quebraria — tem dois no meio do caminho, o
          arrasto da galeria de dores e o painel da seção 05, ver os
          componentes); por isso as camadas do fundo não usam
          `overflow-hidden` nenhum, só o próprio recuo do `mask` de cada
          risco já evita qualquer sobra visível fora da caixa. */}
      <div className="relative">
        <div aria-hidden="true" className="absolute inset-0">
          <DarkGradientLayers />
          {/* Esmaece o topo do fundo pro tom do próprio hero (que não tem
              este padrão), pra a transição não ser um corte seco assim que
              a seção 02 começa. */}
          <div className="absolute inset-x-0 top-0 h-40" style={{ background: "linear-gradient(to bottom, var(--bg), transparent)" }} />
        </div>
        <div className="relative">
          {/* ---------- 02 Formulário ---------- */}
          <section id={formId} className="mx-auto max-w-xl scroll-mt-6 px-5 pt-12 pb-12 sm:pt-16 sm:pb-20">
            <LeadForm page={page.id} copy={page.form} />
          </section>

          <ScrollGallery heading={page.pains.heading} items={page.pains.items} />
          <Benefits />
          <Steps steps={page.steps} />

          {/* ---------- 06 Confiança e apresentação ---------- */}
          <FeaturesWithPanel heading={page.features.heading} items={page.features.items} />

          {/* ---------- 07 Dúvidas ---------- */}
          <Faq items={page.faq} />

          {/* ---------- 08 Chamada final ---------- */}
          <section className="mx-auto max-w-2xl px-5 pt-4 pb-12 text-center sm:pb-20">
            {page.closingText && <p className="mb-6 text-lg text-mute">{page.closingText}</p>}
            <div className="flex justify-center">
              <HeroCta label={hero.cta} targetSelector={`#${formId}`} />
            </div>
          </section>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
