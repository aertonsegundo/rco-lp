import { Check } from "lucide-react";
import type { Block } from "@/content/pages";
import { cn } from "@/lib/utils";

// ============================================================
// Renderiza a lista de `Block`s de uma seção, na ordem do texto. Sem estado:
// roda no servidor. `center` alinha ao centro (hero e chamada final);
// `compact` reduz espaços dentro de cartões.
// ============================================================

export function Blocks({ blocks, center = false, compact = false }: { blocks: Block[]; center?: boolean; compact?: boolean }) {
  return (
    <div className={cn(compact ? "space-y-3" : "space-y-5", center && "text-center")}>
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} center={center} compact={compact} />
      ))}
    </div>
  );
}

function BlockView({ block, center, compact }: { block: Block; center: boolean; compact: boolean }) {
  switch (block.t) {
    case "p":
      return <p className={cn("text-base leading-relaxed text-mute", !compact && "sm:text-lg")}>{block.text}</p>;

    case "strong":
      return (
        <p
          className={cn(
            "text-lg leading-snug font-semibold text-ink sm:text-xl",
            !center && "border-l-4 border-brand pl-4",
          )}
        >
          {block.text}
        </p>
      );

    case "list":
      return (
        <ul className="grid gap-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 text-left">
              <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand/20 text-brand">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              <span className="text-base leading-snug text-ink">{item}</span>
            </li>
          ))}
        </ul>
      );

    case "flow":
      return <Flow variant={block.variant} items={block.items} center={center} />;

    case "cards":
      return (
        <div className={cn("grid gap-4", block.items.length % 2 === 0 && "sm:grid-cols-2")}>
          {block.items.map((card, i) => (
            <article key={card.title} className="rounded-2xl border border-line bg-surface p-6 text-left">
              <span aria-hidden="true" className="mb-3 block text-sm font-bold tracking-widest text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mb-3 text-lg leading-snug font-bold">{card.title}</h3>
              <Blocks blocks={card.blocks} compact />
            </article>
          ))}
        </div>
      );
  }
}

function Flow({ variant, items, center }: { variant: "timeline" | "lines" | "chips"; items: string[]; center: boolean }) {
  if (variant === "chips") {
    return (
      <ul className={cn("flex flex-wrap gap-2", center && "justify-center")}>
        {items.map((item) => (
          <li key={item} className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink sm:text-base">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (variant === "lines") {
    return (
      <ul className="space-y-2.5 text-left">
        {items.map((item) => (
          <li key={item} className="border-l-2 border-brand/60 py-0.5 pl-4 text-base leading-snug text-ink sm:text-lg">
            {item}
          </li>
        ))}
      </ul>
    );
  }

  // timeline: sequência ligada por uma linha vertical.
  return (
    <ol className="text-left">
      {items.map((item, i) => {
        const last = i === items.length - 1;
        return (
          <li key={item} className="relative flex gap-4 pb-5 last:pb-0">
            {!last && <span aria-hidden="true" className="absolute top-5 bottom-0 left-[9px] w-px bg-line" />}
            <span
              aria-hidden="true"
              className={cn(
                "relative z-10 mt-1 size-[19px] shrink-0 rounded-full border-2",
                last ? "border-brand bg-brand" : "border-brand/70 bg-bg",
              )}
            />
            <span className={cn("text-base leading-snug sm:text-lg", last ? "font-semibold text-ink" : "text-ink/90")}>{item}</span>
          </li>
        );
      })}
    </ol>
  );
}
