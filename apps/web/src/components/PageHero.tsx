import type { PageConfig } from "@/content/pages";
import { Blocks } from "./blocks";
import { HeroCta } from "./HeroCta";
import { HeroOrbitBackground } from "./HeroOrbitBackground";
import { Logo } from "./Logo";
import { VideoSlot } from "./video/VideoSlot";

/**
 * Abertura das duas páginas: logo, sobretítulo, H1, texto, (vídeo, só na P04)
 * e o botão que rola até o formulário. Mesmo fundo decorativo de antes
 * (`HeroOrbitBackground`). Uma coluna centralizada: a ordem de leitura da copy
 * (texto, "Assista ao vídeo", vídeo, botão) é a ordem da tela, também no celular.
 * Sem "use client": só os filhos que precisam (botão, vídeo) são de cliente.
 */
export function PageHero({ page, formId }: { page: PageConfig; formId: string }) {
  const { hero, video } = page;
  return (
    <section className="relative overflow-hidden">
      <HeroOrbitBackground />
      <div className="relative mx-auto max-w-3xl px-5 pt-10 pb-12 text-center sm:pt-14 sm:pb-16">
        <Logo className="mx-auto mb-8 block" />
        <p className="mx-auto mb-4 max-w-xl text-sm leading-snug font-semibold tracking-wide text-brand">{hero.eyebrow}</p>
        <h1 className="mb-6 text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl">{hero.title}</h1>
        <Blocks blocks={hero.blocks} center />
        {video ? (
          <div id="video" className="mx-auto mt-8 w-full max-w-2xl scroll-mt-6">
            <VideoSlot source={video.source} page={page.id} />
          </div>
        ) : null}
        <div className="mt-8 flex justify-center">
          <HeroCta label={hero.cta} targetSelector={`#${formId}`} page={page.id} location="hero" />
        </div>
      </div>
    </section>
  );
}
