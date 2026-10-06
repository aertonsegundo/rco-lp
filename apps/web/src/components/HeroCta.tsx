"use client";

import { track } from "@/lib/tracking/events";
import { ShimmerButton } from "./ui/shimmer-button";

/**
 * Botão que rola até o formulário e registra `cta_click`. É um componente de
 * cliente porque o servidor não pode passar função (`onClick`) para outro
 * componente de cliente: recebe só texto (serializável).
 * `location` diz ONDE na página está o botão (hero, como_funciona, chamada_final).
 */
export function HeroCta({
  label,
  targetSelector,
  page,
  location,
}: {
  label: string;
  targetSelector: string;
  page: string;
  location: string;
}) {
  return (
    <ShimmerButton
      width={320}
      className="max-w-full"
      onClick={() => {
        track("cta_click", { page_id: page, cta_location: location, cta_text: label });
        document.querySelector(targetSelector)?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      {label}
    </ShimmerButton>
  );
}
