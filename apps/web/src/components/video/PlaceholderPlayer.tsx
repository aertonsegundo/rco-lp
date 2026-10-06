"use client";

import { useState } from "react";
import type { VideoPlayerProps, VideoSource } from "./types";

type Props = VideoPlayerProps<Extract<VideoSource, { kind: "placeholder" }>>;

export function PlaceholderPlayer({ source, onPlay }: Props) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface to-black">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
        {playing ? (
          <>
            <p className="text-sm font-medium text-mute">Reproduzindo (exemplo)</p>
            <div className="h-1.5 w-2/3 overflow-hidden rounded-full bg-line">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-brand" />
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              aria-label={`Reproduzir: ${source.title}`}
              onClick={() => {
                setPlaying(true);
                onPlay();
              }}
              className="grid size-20 place-items-center rounded-full bg-brand text-white shadow-lg transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
            >
              <svg viewBox="0 0 24 24" className="ml-1 size-9 fill-current" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <p className="text-base font-semibold">{source.title}</p>
            <p className="max-w-sm text-sm text-mute">
              Espaço reservado para o vídeo. Troque a fonte em <code>src/content/pages.ts</code>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
