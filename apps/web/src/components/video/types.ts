// ============================================================
// PLAYER DE VÍDEO TROCÁVEL. A página só conhece `VideoSource`; quem desenha o
// player é um adaptador por `kind`. Trocar o placeholder por Panda/Vimeo/
// YouTube = mudar `source` em content/pages.ts (se o provedor dá iframe, use
// kind "embed") OU criar um adaptador novo e registrá-lo em VideoSlot.tsx.
// Nenhuma seção da página muda.
// ============================================================

export type VideoSource =
  /** Espaço reservado, sem vídeo nenhum. */
  | { kind: "placeholder"; title: string }
  /** Qualquer provedor que ofereça URL de iframe (Panda, Vimeo, YouTube). */
  | { kind: "embed"; url: string; title: string };

export interface VideoPlayerProps<S extends VideoSource = VideoSource> {
  source: S;
  /** Chamado na primeira reprodução (dispara o evento de rastreamento). */
  onPlay: () => void;
}
