"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ============================================================
// Vendorizado de jolyui.dev/r/animated-beam (mesmo registro público do
// liquid-metal-button). Mudanças em relação ao original:
// 1. `BeamNode` usava `bg-background`/`border` genéricos do shadcn, que
//    este projeto não define (os tokens daqui são `--surface`/`--line`,
//    ver globals.css) — troquei pelo equivalente real do projeto.
// 2. As duas `@keyframes` que o SVG referencia (`beam-dash`, o traço
//    "cometa" que percorre o caminho, e `beam-flow`, sem uso nesta versão
//    do componente — nenhum elemento aplica essa máscara) precisam existir
//    em algum CSS global; adicionadas em `globals.css`.
// 3. `animated` (novo, padrão `true` — quem já usava o componente não muda
//    de comportamento): `false` desenha um traço tracejado parado, sem
//    gradiente nem brilho, no lugar do "cometa" animado. Serve pra
//    diferenciar visualmente um fluxo principal (setas animadas, direção
//    clara) de um sinal constante/lateral — não é "mais uma etapa do
//    fluxo", é outra categoria de conexão, e por isso não devia parecer
//    igual. Sem uso em nenhuma seta agora (o desenho atual não precisa),
//    mas fica disponível.
//
// Cheguei a tentar corrigir o "cometa" não percorrer o caminho inteiro em
// caminhos curtos (o dasharray/dashoffset abaixo usa um número de pixel
// fixo, pensado pro caminho bem mais longo do componente original) — duas
// tentativas diferentes, nenhuma confirmada funcionando de verdade (sem
// conseguir testar ao vivo neste ambiente) e pelo menos uma delas piorou
// as coisas. Voltei pro valor original do vendor, a pedido: funciona pior
// em caminhos curtos (o cometa só aparece por uma fração do ciclo), mas é
// o estado que se sabe que renderiza.
// ============================================================

interface AnimatedBeamProps {
  /** Referência do elemento contêiner */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Referência do elemento de início */
  fromRef: React.RefObject<HTMLElement | null>;
  /** Referência do elemento de fim */
  toRef: React.RefObject<HTMLElement | null>;
  /** Curvatura do feixe (-1 a 1, 0 é reto) */
  curvature?: number;
  /** Duração da animação em segundos */
  duration?: number;
  /** Atraso antes da animação começar */
  delay?: number;
  /** Inverte a direção da animação */
  reverse?: boolean;
  /** Espessura do traço do feixe */
  pathWidth?: number;
  /** Cor inicial do gradiente do feixe */
  gradientStartColor?: string;
  /** Cor final do gradiente do feixe */
  gradientStopColor?: string;
  /** `false` = traço tracejado parado, sem cometa nem brilho (ver comentário
   *  no topo do arquivo). Default `true` = comportamento original. */
  animated?: boolean;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  className?: string;
}

const AnimatedBeam = ({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  duration = 2,
  delay = 0,
  reverse = false,
  pathWidth = 2,
  gradientStartColor = "#18181b",
  gradientStopColor = "#18181b",
  animated = true,
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  className,
}: AnimatedBeamProps) => {
  const [pathD, setPathD] = React.useState("");
  const [svgDimensions, setSvgDimensions] = React.useState({ width: 0, height: 0 });
  const uniqueId = React.useId();

  const updatePath = React.useCallback(() => {
    if (!containerRef.current || !fromRef.current || !toRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const fromRect = fromRef.current.getBoundingClientRect();
    const toRect = toRef.current.getBoundingClientRect();

    const startX = fromRect.left - containerRect.left + fromRect.width / 2 + startXOffset;
    const startY = fromRect.top - containerRect.top + fromRect.height / 2 + startYOffset;
    const endX = toRect.left - containerRect.left + toRect.width / 2 + endXOffset;
    const endY = toRect.top - containerRect.top + toRect.height / 2 + endYOffset;

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    // Ponto de controle da curva de Bézier quadrática
    const dx = endX - startX;
    const dy = endY - startY;
    const controlX = midX - dy * curvature;
    const controlY = midY + dx * curvature;

    const path = `M ${startX},${startY} Q ${controlX},${controlY} ${endX},${endY}`;
    setPathD(path);
    setSvgDimensions({ width: containerRect.width, height: containerRect.height });
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset]);

  React.useEffect(() => {
    updatePath();

    const resizeObserver = new ResizeObserver(updatePath);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", updatePath);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePath);
    };
  }, [updatePath, containerRef]);

  if (!animated) {
    return (
      <svg
        className={cn("pointer-events-none absolute top-0 left-0 h-full w-full", className)}
        width={svgDimensions.width}
        height={svgDimensions.height}
        viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={pathD} stroke={gradientStartColor} strokeWidth={pathWidth} strokeDasharray="4 5" strokeLinecap="round" fill="none" opacity={0.5} />
      </svg>
    );
  }

  return (
    <svg
      className={cn("pointer-events-none absolute top-0 left-0 h-full w-full", className)}
      width={svgDimensions.width}
      height={svgDimensions.height}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      // `willChange`: o feixe usa um filtro de desfoque (`feGaussianBlur`,
      // logo abaixo) rodando sem parar em loop — filtro SVG é uma das
      // operações mais caras de repintar que existem, e são 4 feixes ao
      // mesmo tempo na página. A dica pede pro navegador manter isto numa
      // camada própria em vez de reprocessar o filtro junto com o resto da
      // página a cada frame de scroll.
      style={{ willChange: "transform" }}
    >
      <defs>
        {/* Gradiente do caminho de fundo (o traço fraco, sempre visível) */}
        <linearGradient id={`beam-gradient-bg-${uniqueId}`} gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0.1" />
          <stop offset="50%" stopColor={gradientStartColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0.1" />
        </linearGradient>

        {/* Gradiente do feixe animado (o "cometa" que percorre o caminho) */}
        <linearGradient id={`beam-gradient-${uniqueId}`} gradientUnits="userSpaceOnUse" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="5%" stopColor={gradientStartColor} stopOpacity="1" />
          <stop offset="50%" stopColor={gradientStopColor} stopOpacity="1" />
          <stop offset="95%" stopColor={gradientStopColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </linearGradient>

        {/* Filtro de brilho (glow) */}
        <filter id={`beam-glow-${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Máscara (mantida do original; nenhum elemento abaixo a aplica hoje) */}
        <mask id={`beam-mask-${uniqueId}`}>
          <rect
            className="beam-mask-rect"
            x="-100%"
            y="0"
            width="50%"
            height="100%"
            fill="url(#beam-mask-gradient)"
            style={{
              animation: `beam-flow ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
              animationDirection: reverse ? "reverse" : "normal",
            }}
          />
        </mask>

        <linearGradient id="beam-mask-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="black" />
          <stop offset="25%" stopColor="white" />
          <stop offset="75%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </linearGradient>
      </defs>

      {/* Caminho de fundo */}
      <path d={pathD} stroke={`url(#beam-gradient-bg-${uniqueId})`} strokeWidth={pathWidth} strokeLinecap="round" fill="none" />

      {/* Feixe animado, com brilho */}
      <path
        d={pathD}
        stroke={`url(#beam-gradient-${uniqueId})`}
        strokeWidth={pathWidth}
        strokeLinecap="round"
        fill="none"
        filter={`url(#beam-glow-${uniqueId})`}
        className="animated-beam-path"
        style={{
          strokeDasharray: "20 1000",
          strokeDashoffset: reverse ? "-1000" : "1000",
          animation: `beam-dash ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      />
    </svg>
  );
};

interface BeamContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const BeamContainer = React.forwardRef<HTMLDivElement, BeamContainerProps>(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("relative", className)} {...props}>
      {children}
    </div>
  );
});
BeamContainer.displayName = "BeamContainer";

interface BeamNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const BeamNode = React.forwardRef<HTMLDivElement, BeamNodeProps>(({ children, className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("relative z-10 flex items-center justify-center rounded-xl border border-line bg-surface p-3 shadow-sm", className)} {...props}>
      {children}
    </div>
  );
});
BeamNode.displayName = "BeamNode";

export { AnimatedBeam, BeamContainer, BeamNode, type AnimatedBeamProps, type BeamContainerProps, type BeamNodeProps };
