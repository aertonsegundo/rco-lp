"use client";

import { useEffect } from "react";
import type { VideoPlayerProps, VideoSource } from "./types";

type Props = VideoPlayerProps<Extract<VideoSource, { kind: "embed" }>>;

/**
 * Iframe genérico. Ainda não usado: existe para o vídeo real entrar sem
 * redesenhar a página. Só aceita https. Não sabe quando o vídeo tocou (iframe
 * de terceiro não avisa); eventos de progresso exigem o SDK do provedor, que
 * vira um adaptador novo quando o provedor for escolhido.
 */
export function EmbedPlayer({ source, onPlay }: Props) {
  const safe = /^https:\/\//i.test(source.url);
  useEffect(() => {
    // Sem SDK não há evento de "play": conta como visualização do player.
    if (safe) onPlay();
  }, [safe, onPlay]);
  if (!safe) return null;
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black">
      <iframe
        src={source.url}
        title={source.title}
        className="absolute inset-0 size-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
      />
    </div>
  );
}
