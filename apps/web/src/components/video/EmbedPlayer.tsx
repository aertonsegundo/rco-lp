import type { VideoPlayerProps, VideoSource } from "./types";

type Props = VideoPlayerProps<Extract<VideoSource, { kind: "embed" }>>;

/**
 * Iframe genérico. Ainda não usado: existe para o vídeo real entrar sem
 * redesenhar a página. Só aceita https.
 *
 * Iframe de terceiro não avisa quando o vídeo toca nem o progresso, então este
 * adaptador NÃO chama `onPlay`/`onProgress` (chamar ao montar geraria
 * `video_play` falso no GTM). Para ter `video_play` e `video_progress` de
 * verdade, crie um adaptador com o SDK do provedor escolhido (Panda, Vimeo,
 * YouTube...) que chame `onPlay()` e `onProgress(25|50|75|100)`, e registre-o
 * em `VideoSlot.tsx`. Ver docs/gtm-eventos.md.
 */
export function EmbedPlayer({ source }: Props) {
  if (!/^https:\/\//i.test(source.url)) return null;
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
