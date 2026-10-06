import { HeroCta } from "./HeroCta";
import { HeroOrbitBackground } from "./HeroOrbitBackground";
import { HeroTitle } from "./HeroTitle";
import { Logo } from "./Logo";
import { VideoSlot } from "./video/VideoSlot";
import type { VideoSource } from "./video/types";

// ============================================================
// Bloco 01 do fluxo da P04 ("Chamada inicial e vídeo em destaque"): duas
// colunas no desktop (`lg:`), mesmo fundo decorativo do hero da P05
// (`HeroOrbitBackground`). `minmax(0, 1fr)` nas duas colunas (não só
// `1fr`): sem isso, o navegador reserva pra cada coluna pelo menos o
// tamanho do MAIOR conteúdo que cabe nela (`min-width: auto` implícito do
// grid) — e como a caixa do nicho girando (`HeroTitle`) muda de largura
// sozinha a cada troca, a coluna de texto "puxava" largura da coluna do
// vídeo ao vivo, fazendo o holder dele crescer e encolher junto. Com
// `minmax(0, 1fr)` as duas colunas ficam fixas na metade cada uma, e é o
// TEXTO que quebra linha dentro da sua própria largura, não o layout
// inteiro que se mexe.
//
// `cta` é opcional: no fluxo da P04 (ver `LandingPageP04.tsx`) o botão de
// ação vira o bloco 02 (resumo da oferta), separado do vídeo — este
// componente só existe pra outra página que precise do mesmo hero de vídeo
// COM botão embutido, se um dia existir.
// ============================================================

export function VideoHero({
  eyebrow,
  title,
  subtitle,
  cta,
  ctaHref,
  video,
  page,
}: {
  eyebrow: string;
  title: string;
  /** Opcional: no fluxo da P04 (bloco 01) o resumo já vive no bloco 02
   *  (`offerSummary`), separado do vídeo — sem duplicar o mesmo texto. */
  subtitle?: string;
  cta?: string;
  ctaHref: string;
  video: VideoSource;
  page: string;
}) {
  return (
    <section className="relative overflow-hidden">
      <HeroOrbitBackground />
      <div className="relative mx-auto max-w-7xl px-5 pt-12 pb-6">
        <div className="grid items-center gap-10 text-center lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <Logo className="mx-auto mb-8 block" />
            <p className="mb-3 text-sm font-semibold tracking-wide text-brand uppercase">{eyebrow}</p>
            <HeroTitle
              title={title}
              className="justify-center text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-4xl"
            />
            {subtitle ? <p className="mx-auto mt-5 max-w-2xl text-lg text-mute">{subtitle}</p> : null}
            {cta ? (
              <div className="mt-8 flex justify-center">
                <HeroCta label={cta} targetSelector={ctaHref} page={page} location="hero" />
              </div>
            ) : null}
          </div>
          <div id="video" className="mx-auto w-full max-w-lg scroll-mt-6">
            <VideoSlot source={video} page={page} />
          </div>
        </div>
      </div>
    </section>
  );
}
