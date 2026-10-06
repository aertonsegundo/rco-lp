"use client";

import { LayoutGroup, motion } from "motion/react";
import { NICHOS } from "@/content/options";
import { TextRotate } from "./ui/text-rotate";
import { cn } from "@/lib/utils";

// "Outro" é a opção "nenhum dos anteriores" do formulário — não é um nicho
// de verdade pra mostrar girando no título.
const ROTATING_NICHES = NICHOS.filter((n) => n !== "Outro");

/**
 * Título do hero das duas páginas: a frase de sempre (`title`) seguida de
 * "ideal para" e um nicho girando dentro de uma caixa na cor da marca. Os
 * nichos são os mesmos do campo "Nicho" do formulário (`content/options.ts`),
 * não uma lista à parte só pro efeito — se um nicho novo entrar lá, entra
 * aqui também, sem precisar duplicar em dois lugares.
 *
 * "ideal para" funciona igual pra qualquer um dos nichos sem forçar
 * concordância de gênero/número (ao contrário de, por exemplo, encaixar o
 * nicho no meio da frase original).
 */
export function HeroTitle({ title, className }: { title: string; className?: string }) {
  return (
    <LayoutGroup>
      <motion.h1 layout className={cn("flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1", className)}>
        <motion.span layout>
          {title}, ideal para{" "}
        </motion.span>
        <TextRotate
          texts={[...ROTATING_NICHES]}
          mainClassName="inline-flex items-center rounded-lg bg-brand px-2 py-0.5 text-white sm:px-3 sm:py-1"
          staggerFrom="last"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-120%", opacity: 0 }}
          staggerDuration={0.02}
          splitLevelClassName="overflow-hidden"
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
          rotationInterval={2600}
        />
      </motion.h1>
    </LayoutGroup>
  );
}
