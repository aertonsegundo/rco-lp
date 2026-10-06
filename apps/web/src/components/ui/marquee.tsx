import { type ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Vendorizado do registro público do magicui.design (mesmo formato dos
// outros componentes desta pasta: `curl -sS -L
// "https://magicui.design/r/marquee.json"`). Sem mudança nenhuma no
// componente em si: o loop infinito é CSS puro (o conteúdo se repete
// `repeat` vezes lado a lado/empilhado, e a animação desloca esse bloco
// inteiro por exatamente 100% do próprio tamanho + o vão entre repetições
// — quando termina, o próximo bloco repetido já está na posição exata de
// onde o primeiro começou, sem emenda visível).
// ============================================================

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /** Opcional: classe CSS pra estilos customizados */
  className?: string;
  /** Inverte a direção da animação (pra baixo em vez de pra cima, no modo vertical) */
  reverse?: boolean;
  /** Pausa a animação ao passar o mouse por cima */
  pauseOnHover?: boolean;
  /** Conteúdo mostrado no marquee */
  children: React.ReactNode;
  /** Anima na vertical em vez de na horizontal */
  vertical?: boolean;
  /** Quantas vezes repete o conteúdo (precisa ser >1 pro loop não ter buraco visível) */
  repeat?: number;
}

export function Marquee({ className, reverse = false, pauseOnHover = false, children, vertical = false, repeat = 4, ...props }: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className,
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn("flex shrink-0 justify-around gap-(--gap)", {
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
