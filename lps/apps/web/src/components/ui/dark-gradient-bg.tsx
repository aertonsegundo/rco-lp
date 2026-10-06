import type React from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Vendorizado de um fundo escuro decorativo (21st.dev, "elegant-dark-
// pattern"). Adaptações em relação ao original:
// 1. Preto puro (`bg-black`) e a ponta final do gradiente radial viraram
//    `var(--bg)` (o token de fundo do site, azul-marinho bem escuro, não
//    preto) — sem isso a seção destoava visualmente das vizinhas.
// 2. Os "riscos" diagonais eram ciano puro (rgb(0,207,255)), lidos como
//    cor genérica/neon — trocados pelo azul de marca do site (`--brand`),
//    mesma opacidade baixa do original (mesma régua já aplicada no
//    diagrama da seção 3: sem cor solta que não seja do projeto).
// 3. A textura de grão (ruído) era uma imagem hotlinkada de cdn.21st.dev —
//    baixada e guardada em `public/textures/noise.png`, pro site não
//    depender de um serviço de terceiro pra carregar certo.
// 4. `bg-gradient-radial` do destaque final não existe no Tailwind puro
//    (nenhum plugin do projeto define essa classe) — no original, a classe
//    não fazia nada, silenciosamente. Reescrito como gradiente inline.
// 5. Separado em duas peças, `DarkGradientLayers` (só as camadas
//    decorativas) e `DarkGradientBg` (a seção pronta, pra quem não tem
//    restrição de layout): a seção 2 do site (a galeria de dores) usa
//    `position: sticky` pro efeito de rolagem presa, e `overflow-hidden`
//    num ANCESTRAL de um elemento sticky quebra esse efeito — por isso
//    `DarkGradientLayers` é usado solto (sem a `<section>` própria do
//    `DarkGradientBg`) onde quer que fique num ancestral compartilhado com
//    algo sticky. Isso NÃO livra o componente de precisar do próprio
//    `overflow-hidden`, só exige que ele não fique numa posição que seja
//    ancestral do elemento sticky (ver o bug do item 6 abaixo e como
//    `LandingPage.tsx`/`LandingPageP04.tsx` posicionam este componente como
//    IRMÃO do conteúdo, nunca por cima dele).
// 6. BUG CORRIGIDO (rolagem horizontal na página inteira no mobile): os 5
//    "riscos" diagonais usam `transform: skewX(45deg)` numa caixa do
//    tamanho do BLOCO INTEIRO (`inset-0` do wrapper que vai da seção 2 até
//    o formulário — pode passar de mil pixels de altura). `skewX` desloca
//    cada ponto da caixa proporcionalmente à ALTURA dele; numa caixa muito
//    alta, isso empurra a borda de baixo da caixa MUITO além da largura da
//    tela. O `mask` de cada risco esconde isso visualmente (por isso nunca
//    apareceu num print), mas `mask` só afeta pintura, não o tamanho
//    "rolável" que o navegador calcula pro elemento — o resultado real era
//    a página inteira ganhando uma barra de rolagem horizontal enorme no
//    celular. A correção: este componente agora sempre embrulha as
//    camadas num `overflow-hidden` PRÓPRIO (não de quem chama), que corta
//    o transform sem quebrar nenhum sticky (ver item 5 — ele nunca é
//    ancestral de nada sticky, só irmão).
//
// `rgba(13, 103, 240, 0)` abaixo (em vez do genérico `transparent`) é de
// propósito, do próprio original: um gradiente que termina em `transparent`
// (que é tecnicamente "preto transparente") pode passar por um tom
// acinzentado no meio da transição; terminar num mesmo tom com alfa 0
// evita isso. Só funciona escrito à mão porque `--brand` é um token, não
// dá pra derivar o alfa 0 dele via CSS puro — é o mesmo RGB de `--brand`
// (`#0d67f0`, globals.css); se `--brand` mudar de cor, este valor precisa
// acompanhar.
// ============================================================

export function DarkGradientLayers() {
  return (
    // `willChange`: pede pro navegador tratar isto como uma camada própria
    // (composta uma vez, não repintada a cada frame). `mask` (5 vezes, uma
    // por risco diagonal, mais a máscara do gradiente radial) é uma das
    // propriedades mais caras de pintar que existem — sem essa dica, o
    // celular pode ficar recalculando essas máscaras a cada pixel de
    // scroll, numa página que vai da seção 2 até o formulário (bem alta),
    // travando o scroll inteiro, não só desta seção. É só uma dica pro
    // navegador, não muda nada visualmente.
    <div className="absolute inset-0 overflow-hidden" style={{ willChange: "transform" }}>
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-100"
          style={{
            background: "radial-gradient(100% 100% at 0% 0%, rgb(30, 40, 64) 0%, var(--bg) 100%)",
            mask: "radial-gradient(125% 100% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.224) 88.2883%, rgba(0, 0, 0, 0) 100%)",
          }}
        >
          {/* Riscos diagonais esmaecidos, na cor de marca do site */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: "linear-gradient(var(--brand) 0%, rgba(13, 103, 240, 0) 100%)",
              mask: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 36%, rgb(0, 0, 0) 55%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: "linear-gradient(var(--brand) 0%, rgba(13, 103, 240, 0) 100%)",
              mask: "linear-gradient(90deg, rgba(0, 0, 0, 0) 11%, rgb(0, 0, 0) 25%, rgba(0, 0, 0, 0.55) 41%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: "linear-gradient(var(--brand) 0%, rgba(13, 103, 240, 0) 100%)",
              mask: "linear-gradient(90deg, rgba(0, 0, 0, 0) 9%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 28%, rgba(0, 0, 0, 0.424) 40%, rgb(0, 0, 0) 48%, rgba(0, 0, 0, 0.267) 54%, rgba(0, 0, 0, 0.13) 78%, rgb(0, 0, 0) 88%, rgba(0, 0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: "linear-gradient(var(--brand) 0%, rgba(13, 103, 240, 0) 100%)",
              mask: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 17%, rgba(0, 0, 0, 0.55) 26%, rgb(0, 0, 0) 35%, rgba(0, 0, 0, 0) 47%, rgba(0, 0, 0, 0.13) 69%, rgb(0, 0, 0) 79%, rgba(0, 0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: "linear-gradient(var(--brand) 0%, rgba(13, 103, 240, 0) 100%)",
              mask: "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 27%, rgb(0, 0, 0) 42%, rgba(0, 0, 0, 0) 48%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 74%, rgb(0, 0, 0) 82%, rgba(0, 0, 0, 0.47) 88%, rgba(0, 0, 0, 0) 97%)",
              transform: "skewX(45deg)",
            }}
          />
        </div>
      </div>

      {/* Grão sutil (textura de ruído, vendorizada em public/textures/noise.png) */}
      <div className="absolute inset-0 bg-repeat opacity-5" style={{ backgroundImage: 'url("/textures/noise.png")', backgroundSize: "150px" }} />

      {/* Trama de pontinhos, sutil */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Destaque radial sutil no centro */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, rgba(30, 41, 59, 0.2), transparent 70%)" }} />
    </div>
  );
}

interface DarkGradientBgProps {
  children?: React.ReactNode;
  className?: string;
}

/** Seção pronta com o fundo decorativo. Usa em qualquer seção comum, sem
 *  `position: sticky` no meio do caminho (ver comentário no topo do
 *  arquivo) — pra essas, usa `DarkGradientLayers` direto. */
export function DarkGradientBg({ children, className }: DarkGradientBgProps) {
  return (
    <section className={cn("relative w-full overflow-hidden", className)} style={{ backgroundColor: "var(--bg)" }}>
      <div aria-hidden="true">
        <DarkGradientLayers />
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}
