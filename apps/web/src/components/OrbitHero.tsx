import { HeroCta } from "./HeroCta";
import { HeroOrbitBackground } from "./HeroOrbitBackground";
import { HeroTitle } from "./HeroTitle";
import { Logo } from "./Logo";

// ============================================================
// Hero da P05: logo da RCO ao centro, orbitado pelos logos das ferramentas
// que o CRM integra (`HeroOrbitBackground`, reaproveitado também no hero da
// P04, que tem o mesmo fundo).
//
// Adaptado de um componente de waitlist (21st.dev): trocamos as 3 imagens
// decorativas por logos de marca de verdade, e removemos o campo de e-mail
// com confete de sucesso simulado — essa página já tem um formulário real
// (nome, WhatsApp, nicho, faturamento) na seção de Ação, mais abaixo; um
// segundo campo de captura aqui, fingindo sucesso sem enviar nada de
// verdade, seria uma interação enganosa numa página pública. `cta` é um
// link comum, que rola até esse formulário.
//
// `cta`/`ctaHref` opcionais: pedido explícito do usuário pra tirar o botão
// do hero e mover ele pra depois do FAQ (ver `LandingPage.tsx`) — o hero
// virou só texto, sem chamada pra ação própria.
//
// Sem "use client": nada aqui tem estado, então roda no servidor.
// ============================================================

export function OrbitHero({
  eyebrow,
  title,
  subtitle,
  cta,
  ctaHref,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta?: string;
  ctaHref?: string;
}) {
  return (
    <section className="relative flex min-h-[55vh] w-full items-center justify-center overflow-hidden px-5 pt-10 pb-4 md:min-h-[85vh] md:py-20">
      <HeroOrbitBackground />

      <div className="relative mx-auto max-w-2xl text-center">
        <Logo className="mx-auto mb-8 block" />
        <p className="mb-3 text-sm font-semibold tracking-wide text-brand uppercase">{eyebrow}</p>
        <HeroTitle title={title} className="text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl" />
        <p className="mx-auto mt-5 max-w-xl text-lg text-mute">{subtitle}</p>
        {/* Rola até o formulário ao clicar, não `href`: o componente é um
            `<button>` (não dá pra aninhar link dentro dele), e o efeito de
            metal líquido já é WebGL, então já depende de JS mesmo. */}
        {cta && ctaHref && (
          <div className="mt-8 flex justify-center">
            <HeroCta label={cta} targetSelector={ctaHref} />
          </div>
        )}
      </div>
    </section>
  );
}
