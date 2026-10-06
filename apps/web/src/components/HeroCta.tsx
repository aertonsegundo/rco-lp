"use client";

import { ShimmerButton } from "./ui/shimmer-button";

/**
 * Só existe porque `OrbitHero` é um componente de servidor (sem estado, ver
 * o comentário lá) e não pode passar uma função (`onClick`) pra um
 * componente cliente como `ShimmerButton` — o Next não deixa serializar
 * função do servidor pro cliente. Este arquivo isola só o clique (rolar até
 * o formulário), recebendo do servidor só texto (`label`, `targetSelector`),
 * que é serializável.
 */
export function HeroCta({ label, targetSelector }: { label: string; targetSelector: string }) {
  return (
    <ShimmerButton
      width={240}
      onClick={() => document.querySelector(targetSelector)?.scrollIntoView({ behavior: "smooth" })}
    >
      {label}
    </ShimmerButton>
  );
}
