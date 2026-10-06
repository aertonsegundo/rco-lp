import { BRAND_ICONS, BrandIcon, iconRenderSize, type BrandIcon as BrandIconType } from "./icons/brand-icons";

// ============================================================
// Fundo decorativo do hero: logos das ferramentas integradas girando em
// dois anéis concêntricos, atrás do conteúdo. Nasceu só na P05 (OrbitHero),
// extraído pra cá pra reaproveitar também no hero da P04 (mesmo efeito nas
// duas páginas, a pedido do usuário). Cada logo se repete algumas vezes ao
// redor de cada anel (mais posições do que ícones distintos): um anel com
// só 5 a 6 ícones soltos, um em cada posição, fica com buracos grandes e
// parece incompleto.
//
// Os dois anéis têm raios bem diferentes: a folga entre a borda de dentro
// do anel externo e a borda de fora do interno é bem maior que o tamanho de
// qualquer ícone (ver o cálculo logo abaixo de OUTER_RING/INNER_RING), pra
// nunca se cruzarem visualmente, mesmo girando em velocidades e direções
// diferentes. Cada anel também usa um offset de ciclo diferente sobre a
// MESMA lista de logos (ver `cycle`), pra não ficarem alinhados
// radialmente o tempo todo.
//
// Quem usa este componente precisa: `position: relative` + `overflow-
// hidden` na seção (os anéis são bem maiores que qualquer hero, cortados
// pela borda de propósito) e o conteúdo de verdade por cima com `relative`
// (os anéis são `position: absolute`, mas sem `z-index`, então empilham na
// ordem do DOM — qualquer coisa depois deles no HTML já fica por cima).
//
// Adaptado de um componente de waitlist (21st.dev): trocamos as 3 imagens
// decorativas por logos de marca de verdade.
//
// Sem "use client": nada aqui tem estado, então roda no servidor.
// ============================================================

function bySlug(...slugs: string[]): BrandIconType[] {
  return slugs.map((slug) => {
    const icon = BRAND_ICONS.find((i) => i.slug === slug);
    if (!icon) throw new Error(`ícone de marca desconhecido: ${slug}`);
    return icon;
  });
}

/** Preenche `count` posições repetindo `icons` em ciclo, a partir de `offset`
 *  (dois anéis com o mesmo offset ficariam com os ícones sempre alinhados
 *  no mesmo ângulo um do outro; cada anel usa um offset diferente). */
function cycle(icons: readonly BrandIconType[], count: number, offset: number): BrandIconType[] {
  return Array.from({ length: count }, (_, i) => icons[(i + offset) % icons.length]!);
}

const ALL_ICONS = bySlug("whatsapp", "meta", "instagram", "googleads", "facebook", "kiwify");

// No mobile, só o anel externo aparece, num raio bem menor (250px, pedido
// explícito do usuário) — o anel interno some (`hidden sm:block` no lugar
// onde é usado, mais abaixo). A partir de `sm`, os dois voltam a aparecer
// nos valores originais (380/560), a mesma folga de sempre entre eles. Sem
// JS pra isso: o raio de cada anel é uma variável CSS (`--ring-radius`)
// que já muda de valor sozinha pela media query do Tailwind
// (`sm:[--ring-radius:...]`), não um número calculado no servidor.
const OUTER_SIZE = 52;
const INNER_SIZE = 42;

const OUTER_RING = { icons: cycle(ALL_ICONS, 14, 0), size: OUTER_SIZE, radiusClassName: "[--ring-radius:250px] sm:[--ring-radius:560px]" };
const INNER_RING = { icons: cycle(ALL_ICONS, 10, 3), size: INNER_SIZE, radiusClassName: "[--ring-radius:380px]" };

function OrbitRing({
  icons,
  radiusClassName,
  size,
  reverse,
  opacity,
}: {
  icons: readonly BrandIconType[];
  /** Classe Tailwind que define `--ring-radius` (pode variar por
   *  breakpoint, ver `OUTER_RING`/`INNER_RING`) — não um número fixo. */
  radiusClassName: string;
  size: number;
  reverse?: boolean;
  opacity: number;
}) {
  const n = icons.length;
  return (
    <div
      className={`absolute top-1/2 left-1/2 size-0 ${radiusClassName} ${reverse ? "animate-orbit-spin-reverse" : "animate-orbit-spin"}`}
      style={{ opacity }}
    >
      {icons.map((icon, i) => {
        // Ícones com `scale` (ver brand-icons.tsx) renderizam maiores que o
        // "size" nominal do anel; centraliza pelo tamanho de fato, senão
        // esse ícone fica deslocado do centro do próprio slot na órbita.
        const renderSize = iconRenderSize(icon, size);
        return (
          <div
            // O mesmo logo aparece em mais de uma posição do anel de
            // propósito (ver comentário acima) — a chave usa a posição, não
            // só o slug.
            key={`${icon.slug}-${i}`}
            className="absolute top-0 left-0"
            style={{ transform: `rotate(${(360 / n) * i}deg) translateX(var(--ring-radius))` }}
          >
            {/* Contragira na mesma duração do anel: o ícone revolve ao redor
                do centro (herda a posição do anel) mas fica sempre em pé. */}
            <div
              className={reverse ? "animate-orbit-spin" : "animate-orbit-spin-reverse"}
              style={{ marginLeft: -renderSize / 2, marginTop: -renderSize / 2 }}
            >
              <BrandIcon icon={icon} size={size} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function HeroOrbitBackground() {
  return (
    <>
      {/* Camada decorativa: logos girando atrás do conteúdo. O raio de cada
          anel (acima) já mantém os ícones fora da área do texto; este
          esmaecimento é só pra suavizar onde a órbita é cortada pela borda
          da seção (`overflow-hidden`), não pra escondê-la do texto. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <OrbitRing {...OUTER_RING} opacity={0.3} />
        {/* Só a partir de `sm`: no mobile é só o anel externo, sozinho. */}
        <div className="hidden sm:block">
          <OrbitRing {...INNER_RING} opacity={0.4} reverse />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(to bottom, var(--bg), transparent 15%, transparent 85%, var(--bg))" }}
      />
    </>
  );
}
