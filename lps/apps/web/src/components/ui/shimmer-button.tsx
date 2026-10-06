import React, { type ComponentPropsWithoutRef, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Vendorizado do registro público do magicui.design (mesmo formato de
// registro shadcn dos outros componentes desta pasta:
// `curl -sS -L "https://magicui.design/r/shimmer-button.json"`). O brilho
// (`shimmerColor`) é um conic-gradient girando sozinho atrás do botão (ver
// `@keyframes spin-around`/`shimmer-slide` em `globals.css`), visível só no
// anel fino que sobra entre a borda de fora e o "backdrop" interno
// (`--cut`) — por isso ele parece dar a volta na borda o tempo todo, sem
// nunca parar.
//
// Mudanças em relação ao original:
// 1. A variável interna de fundo era `--bg`, que colide com o token global
//    do projeto (`--bg` em globals.css, o azul-marinho de fundo da
//    página) — renomeada pra `--shimmer-btn-bg` só pra não sombrear o
//    token de verdade dentro da árvore do botão.
// 2. Defaults trocados pro esquema deste site (fundo branco, brilho azul
//    da marca via `var(--brand)`, texto na cor `--bg`) em vez do padrão
//    upstream (fundo preto, brilho branco, texto branco) — é o único uso
//    deste componente no projeto. Quem precisar do esquema original ainda
//    pode, passando `background`/`shimmerColor`/`className` na chamada.
// 3. A camada "Highlight" (relevo brilhante simulado por `inset shadow`)
//    era branca por dentro, pensada pra um botão escuro — invertida pra
//    preta (`#000000` em baixa opacidade), porque num fundo branco um
//    brilho branco por dentro não apareceria.
// 4. `width`/`height`: não existem no original (o tamanho vem só do
//    padding); acrescentadas pelo mesmo motivo do `liquid-metal-button.tsx`
//    que este componente substitui (os dois lugares em que este projeto usa
//    botão precisam do mesmo tamanho combinado entre o CTA do hero e o
//    "enviar" do formulário, com textos de tamanhos diferentes).
// ============================================================

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  /** Sobrescreve a largura (o original não tinha essa opção). */
  width?: number;
  /** Sobrescreve a altura (o original não tinha essa opção). */
  height?: number;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "var(--brand)",
      shimmerSize = "0.2em",
      shimmerDuration = "2.6s",
      borderRadius = "100px",
      background = "#ffffff",
      width,
      height,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        style={
          {
            "--spread": "160deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--shimmer-btn-bg": background,
            ...(width !== undefined ? { width: `${width}px` } : null),
            ...(height !== undefined ? { height: `${height}px` } : null),
            ...style,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden [border-radius:var(--radius)] border border-black/5 px-6 py-3 font-semibold whitespace-nowrap text-bg [background:var(--shimmer-btn-bg)]",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px disabled:cursor-wait disabled:opacity-60",
          className,
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div className="@container-[size] absolute inset-0 -z-30 overflow-visible blur-[2px]">
          {/* spark */}
          <div className="animate-shimmer-slide absolute inset-0 aspect-[1] h-[100cqh] rounded-none [mask:none]">
            {/* spark before */}
            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [translate:0_0] [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
          </div>
        </div>

        {children}

        {/* Highlight (ver adaptação 3 no comentário do topo) */}
        <div
          className={cn(
            "absolute inset-0 size-full",
            "rounded-2xl px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#00000014]",
            "transform-gpu transition-all duration-300 ease-in-out",
            "group-hover:shadow-[inset_0_-6px_10px_#00000026]",
            "group-active:shadow-[inset_0_-10px_10px_#00000026]",
          )}
        />

        {/* backdrop: cobre tudo menos o anel de espessura `--cut`, onde o
            brilho por trás (spark) fica visível */}
        <div className="absolute inset-(--cut) -z-20 [border-radius:var(--radius)] [background:var(--shimmer-btn-bg)]" />
      </button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";
