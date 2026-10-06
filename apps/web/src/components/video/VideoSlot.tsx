"use client";

import { useCallback, useRef, type ComponentType } from "react";
import { track, type VideoMilestone } from "@/lib/tracking/events";
import { EmbedPlayer } from "./EmbedPlayer";
import { PlaceholderPlayer } from "./PlaceholderPlayer";
import type { VideoPlayerProps, VideoSource } from "./types";

// O tipo obriga a ter um adaptador para CADA `kind`: adicionar um provedor
// novo em types.ts sem registrar aqui não compila.
const PLAYERS: { [K in VideoSource["kind"]]: ComponentType<VideoPlayerProps<Extract<VideoSource, { kind: K }>>> } = {
  placeholder: PlaceholderPlayer,
  embed: EmbedPlayer,
};

/**
 * Dono dos eventos de vídeo: o adaptador só avisa `onPlay` e `onProgress(25|50|75|100)`;
 * aqui cada um vira evento UMA vez por visita. O espaço reservado (`placeholder`)
 * não é vídeo de verdade, então NÃO gera `video_play` (poluiria o GTM): os eventos
 * só passam a existir quando o vídeo real entrar (ver docs/gtm-eventos.md).
 */
export function VideoSlot({ source, page }: { source: VideoSource; page: string }) {
  const played = useRef(false);
  const reached = useRef(new Set<VideoMilestone>());
  const real = source.kind !== "placeholder";

  const onPlay = useCallback(() => {
    if (!real || played.current) return;
    played.current = true;
    track("video_play", { page_id: page, video_provider: source.kind });
  }, [page, real, source.kind]);

  const onProgress = useCallback(
    (percent: VideoMilestone) => {
      if (!real || reached.current.has(percent)) return;
      reached.current.add(percent);
      track("video_progress", { page_id: page, video_provider: source.kind, percent });
    },
    [page, real, source.kind],
  );

  const Player = PLAYERS[source.kind] as ComponentType<VideoPlayerProps>;
  return <Player source={source} onPlay={onPlay} onProgress={onProgress} />;
}
