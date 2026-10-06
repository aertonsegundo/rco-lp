"use client";

import { useCallback, useRef, type ComponentType } from "react";
import { trackEvent } from "@/lib/tracking/events";
import { EmbedPlayer } from "./EmbedPlayer";
import { PlaceholderPlayer } from "./PlaceholderPlayer";
import type { VideoPlayerProps, VideoSource } from "./types";

// O tipo obriga a ter um adaptador para CADA `kind`: adicionar um provedor
// novo em types.ts sem registrar aqui não compila.
const PLAYERS: { [K in VideoSource["kind"]]: ComponentType<VideoPlayerProps<Extract<VideoSource, { kind: K }>>> } = {
  placeholder: PlaceholderPlayer,
  embed: EmbedPlayer,
};

export function VideoSlot({ source, page }: { source: VideoSource; page: string }) {
  const fired = useRef(false);
  const onPlay = useCallback(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent("lp_video_play", { page, video: source.kind });
  }, [page, source.kind]);

  const Player = PLAYERS[source.kind] as ComponentType<VideoPlayerProps>;
  return <Player source={source} onPlay={onPlay} />;
}
