import type { PageConfig } from "@/content/pages";
import { Faq } from "./Faq";
import { LeadForm } from "./LeadForm";
import { OfferSummary, Results, SiteFooter, Steps } from "./sections";
import { DarkGradientLayers } from "./ui/dark-gradient-bg";
import { VideoHero } from "./VideoHero";

// ============================================================
// Fluxo PRÓPRIO da P04 — não é a P05 com um vídeo colado em cima. Ordem
// definida à parte (não é a estrutura AIDA da P05, ver LandingPage.tsx):
//   01 Chamada inicial e vídeo em destaque → VideoHero (capa, controles,
//      preparado pra celular; sem botão — ver bloco 02)
//   02 Formulário                          → LeadForm (pedido explícito do
//      usuário: logo depois do vídeo, sem esperar o resto da página)
//   03 Resultados e depoimentos            → Results (sem material de prova
//      real ainda; ver o comentário no componente — mostra um aviso disso
//      mesmo em vez de inventar depoimento ou número pra preencher; troca
//      sozinho pro carrossel de depoimentos assim que existir um de verdade)
//   04 Como o trabalho acontece            → Steps (reaproveitado da P05,
//      mesmo componente e mesmo conteúdo: o processo real não muda de
//      página pra página)
//   05 Dúvidas                             → Faq (reaproveitado da P05,
//      mesmo conteúdo: mesma oferta, mesmas perguntas; não fica mais junto
//      do formulário, que subiu pro bloco 02)
//   06 Resumo da oferta e chamada final    → OfferSummary (texto + o mesmo
//      botão do bloco 02; pedido explícito do usuário pra vir só depois do
//      FAQ, não mais logo depois do vídeo)
// `pains` (as dores) e `features` (painel "por que escolher") da P05 NÃO
// entram aqui — não fazem parte do fluxo pedido pra esta página.
//
// Comportamento do vídeo (do planejamento da P04): assistir não é
// obrigatório (o formulário já é alcançável desde o bloco 02, sem depender
// do vídeo) e não tem autoplay com som (o placeholder exige clique) — os
// dois já valem hoje. Progresso medido (25/50/75%/conclusão) e resiliência
// a falha de vídeo real ainda dependem de decisão de roteiro/hospedagem da
// VSL (nenhuma escolhida ainda) e do SDK do provedor escolhido — ver o
// comentário em `components/video/EmbedPlayer.tsx`; não dá pra implementar
// isso de verdade sem essa decisão.
// ============================================================

export function LandingPageP04({ page }: { page: PageConfig }) {
  const { hero, video, offerSummary, results } = page;
  const formId = "formulario";

  if (!video || !offerSummary || !results) {
    throw new Error("LandingPageP04 exige page.video, page.offerSummary e page.results.");
  }

  return (
    <main>
      {/* ---------- 01 Chamada inicial e vídeo em destaque ---------- */}
      <VideoHero eyebrow={hero.eyebrow} title={hero.title} ctaHref={`#${formId}`} video={video.source} page={page.id} />

      {/* ---------- 02 a 06: um fundo só, contínuo (mesmo padrão da P05) ---------- */}
      <div className="relative">
        <div aria-hidden="true" className="absolute inset-0">
          <DarkGradientLayers />
          <div className="absolute inset-x-0 top-0 h-40" style={{ background: "linear-gradient(to bottom, var(--bg), transparent)" }} />
        </div>
        <div className="relative">
          {/* ---------- 02 Formulário ---------- */}
          <section id={formId} className="mx-auto max-w-xl scroll-mt-6 px-5 pt-12 pb-12 sm:pt-16 sm:pb-20">
            <LeadForm page={page.id} copy={page.form} />
          </section>

          {/* ---------- 03 Resultados e depoimentos ---------- */}
          <Results results={results} />

          {/* ---------- 04 Como o trabalho acontece ---------- */}
          <Steps steps={page.steps} />

          {/* ---------- 05 Dúvidas ---------- */}
          <Faq items={page.faq} page={page.id} />

          {/* ---------- 06 Resumo da oferta e chamada final ---------- */}
          <OfferSummary text={offerSummary.text} cta={hero.cta} formId={formId} page={page.id} />
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
