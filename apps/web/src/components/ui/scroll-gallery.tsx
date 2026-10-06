"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { Clock, EyeOff, Repeat, TrendingDown, UserRoundX, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// Adaptado de uma galeria horizontal (21st.dev, "Tokyo Nights"): rolar a
// página verticalmente arrasta um conjunto de cartões grandes na horizontal,
// presos (sticky) na tela enquanto isso acontece, um de cada vez.
//
// Diferenças do original:
// 1. Cada cartão lá tinha uma foto de fundo (still de uma galeria de fotos
//    de verdade). Aqui o fundo é uma imagem gerada por IA (prompt escrito
//    pra cada dor, ver histórico da conversa) quando existe, e um gradiente
//    gerado (mesma composição, girando de matiz por cartão) enquanto não
//    existe — vai sendo trocado item por item conforme as imagens chegam.
//    Diferente de fingir uma foto de banco de imagem como se fosse um
//    print ou registro real, aqui está claro que é arte gerada, então não
//    tem o problema de fabricar prova falsa (mesma régua do resto do site,
//    ver o comentário sobre `features` em `content/pages.ts`).
// 2. No lugar do número ("01", "02"...), um ícone (lucide-react) que
//    representa a dor.
// 3. Progresso 0 já começa com o PRIMEIRO cartão centralizado na tela (não
//    encostado na borda esquerda), e progresso 1 termina com o ÚLTIMO
//    cartão centralizado — os outros vão surgindo dos dois lados conforme
//    rola. `xStart`/`travel` abaixo fazem essa conta a partir de medidas
//    reais (largura da tela, da fileira toda e de UM cartão), não um número
//    fixo de vh chutado: com pouco conteúdo numa tela muito larga, a
//    fileira já cabe inteira sem precisar rolar nada, e "arrastar" um
//    conteúdo que já cabe só empurra tudo pra fora sem nada de novo pra
//    revelar (a tela fica em branco no meio do scroll). Cartões grandes e 5
//    itens somados já bastam pra isso nunca acontecer em telas normais, mas
//    a medição continua aqui como rede de segurança pra telas muito largas.
// 4. `useReducedMotion` desliga o efeito preso-e-arrasta pra quem pediu
//    menos movimento no sistema operacional, e a mesma medição de largura
//    também desliga sozinha quando não há nada pra revelar: nos dois casos
//    vira uma lista comum, com rolagem horizontal só de arrastar, sem nada
//    preso na tela.
//
// `sectionRef`/`wrapperRef`/`rowRef` ficam presos aos MESMOS elementos nos
// dois modos (só a classe/estilo muda, nunca a árvore): trocar de elemento
// no meio do caminho quebraria o `useScroll` (que já estaria de olho no nó
// antigo) e a régua de medição (que mediria uma estrutura que não é mais a
// renderizada).
// ============================================================

export type PainIcon = "trend-down" | "clock" | "repeat" | "eye-off" | "lost-history";

const PAIN_ICONS: Record<PainIcon, LucideIcon> = {
  "trend-down": TrendingDown,
  clock: Clock,
  repeat: Repeat,
  "eye-off": EyeOff,
  "lost-history": UserRoundX,
};

// Mesma composição de gradiente pra todo cartão (dois círculos suaves nas
// cores da marca), só girando o matiz por índice, pra cada cartão ter uma
// arte um pouco diferente sem precisar de uma imagem por trás.
const HUE_STEP = 360 / 5;

function PainCard({ icon, text, image, index }: { icon: PainIcon; text: string; image?: string; index: number }) {
  const Icon = PAIN_ICONS[icon];
  return (
    <div className="relative h-[460px] w-[280px] shrink-0 overflow-hidden rounded-2xl border border-line sm:h-[480px] sm:w-[380px]">
      {image ? (
        <Image src={image} alt="" fill sizes="380px" className="object-cover" priority={index === 0} />
      ) : (
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            filter: `hue-rotate(${index * HUE_STEP}deg)`,
            background:
              "radial-gradient(circle at 20% 15%, color-mix(in srgb, var(--brand) 65%, transparent) 0%, transparent 55%)," +
              "radial-gradient(circle at 85% 75%, color-mix(in srgb, var(--ok) 45%, transparent) 0%, transparent 60%)," +
              "var(--surface)",
          }}
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, transparent 35%, var(--bg) 100%)" }}
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 sm:p-7">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-bg/70 text-ink ring-1 ring-line">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <p className="text-lg leading-snug font-medium text-ink">{text}</p>
      </div>
    </div>
  );
}

export interface PainItem {
  icon: PainIcon;
  text: string;
  /** Imagem gerada por IA a partir do prompt daquela dor (ver conversa).
   *  Enquanto não existe, o cartão usa o gradiente gerado. */
  image?: string;
}

export function ScrollGallery({ heading, items }: { heading: string; items: PainItem[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Largura visível, largura de toda a fileira e largura de UM cartão (os
  // dois medidos de verdade, não chutados: o breakpoint `sm:` muda o
  // tamanho do cartão, então só o próprio elemento sabe o valor certo em
  // cada tela). 0 até a primeira medição (efeito abaixo).
  const [metrics, setMetrics] = useState({ wrapperWidth: 0, rowWidth: 0, cardWidth: 0 });

  useLayoutEffect(() => {
    function measure() {
      const sectionEl = sectionRef.current;
      const wrapperEl = wrapperRef.current;
      const rowEl = rowRef.current;
      if (!sectionEl || !wrapperEl || !rowEl) return;
      // Largura disponível medida pela SECTION (nunca muda de classe entre
      // os dois modos), não pelo wrapper: no primeiro render `usePin` ainda
      // é falso (estado inicial zerado), então o wrapper está com a classe
      // do modo estático (`max-w-6xl`, mais estreita). Medir por ele aqui
      // grudaria esse valor estreito errado pro resto da vida do
      // componente, mesmo depois de virar preso-e-arrasta (nada dispara
      // uma remedição só porque o modo mudou). O padding é o mesmo `px-5`
      // nos dois modos, então descontar ele da section dá a largura certa
      // em qualquer um dos dois.
      const wrapperStyle = getComputedStyle(wrapperEl);
      const paddingX = parseFloat(wrapperStyle.paddingLeft) + parseFloat(wrapperStyle.paddingRight);
      const wrapperWidth = Math.max(0, sectionEl.clientWidth - paddingX);
      const rowWidth = rowEl.scrollWidth;
      const cardWidth = (rowEl.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
      setMetrics({ wrapperWidth, rowWidth, cardWidth });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items.length]);

  const { wrapperWidth, rowWidth, cardWidth } = metrics;
  // Primeiro cartão centralizado em repouso (progresso 0): a fileira começa
  // deslocada pra direita por essa folga, não encostada na borda esquerda.
  const xStart = (wrapperWidth - cardWidth) / 2;
  // Distância de centro a centro do primeiro ao último cartão: rolar isso
  // termina com o ÚLTIMO cartão centralizado (mesma folga do início, agora
  // do lado de fora à direita). Não depende da largura da tela.
  const travel = Math.max(0, rowWidth - cardWidth);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [xStart, xStart - travel]);

  const usePin = !prefersReducedMotion && rowWidth > wrapperWidth;

  return (
    <section ref={sectionRef} className="relative" style={usePin ? { height: `calc(100dvh + ${travel}px)` } : undefined}>
      {/* O corte horizontal do que passa da tela é feito pelo `overflow-hidden`
          do wrapper logo abaixo, não aqui: `overflow-x-hidden` NESTA section
          (ancestral do elemento sticky) faria o Chrome tratá-la como
          contêiner de rolagem, e um contêiner de rolagem no meio do caminho
          quebra o `position: sticky` dos filhos (o navegador passa a medir
          "grudado" contra ele, não contra a janela).

          `dvh`, não `vh`: no celular, `100vh` conta a barra de endereço do
          navegador como se fosse tela disponível (ela MEDE o tamanho certo,
          mas ocupa espaço de verdade por cima do conteúdo antes de recolher
          ao rolar) — o título ficava parcialmente atrás dela. `dvh`
          (dynamic viewport height) já desconta isso sozinho. */}
      <div
        ref={wrapperRef}
        className={cn(
          "flex flex-col items-center gap-4 px-5 sm:gap-10",
          // De volta a `justify-center` nos dois modos: `justify-start`
          // (tentativa anterior) evitava cortar o título, mas como o
          // conteúdo (título + vão + cartão) quase sempre é MENOR que a
          // tela, sobrava um vão vazio enorme embaixo do cartão dentro da
          // mesma caixa presa (bug relatado, com print). Centralizado,
          // esse espaço sobrando fica dividido em cima/embaixo, sem gerar
          // vão vazio visível — e com `dvh` (já corrigido) no lugar de
          // `vh`, o título só seria cortado num caso bem mais raro (tela
          // realmente curta), não no dia a dia.
          usePin ? "sticky top-0 h-dvh justify-center overflow-hidden" : "mx-auto max-w-6xl py-10 sm:py-16",
        )}
      >
        <h2 className="text-center text-2xl font-bold">{heading}</h2>
        {/* `self-start`: sem isto, o `items-center` do wrapper (acima) centraliza
            a própria fileira quando ela é mais larga que a tela, competindo
            com o `xStart` calculado acima (que já é a folga certa pra
            centralizar só o PRIMEIRO cartão) — os dois deslocamentos se
            somariam e o primeiro cartão sairia do centro. */}
        <motion.div
          ref={rowRef}
          className={cn("flex w-max shrink-0 gap-6 self-start", !usePin && "max-w-full overflow-x-auto pb-2")}
          style={usePin ? { x } : undefined}
        >
          {items.map((item, i) => (
            <PainCard key={item.text} index={i} icon={item.icon} text={item.text} image={item.image} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
