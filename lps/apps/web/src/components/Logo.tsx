import Image from "next/image";
import { LOGO } from "@/content/site";

/**
 * Logo do CRM (COMERCIAL-RCO), reaproveitado nas LPs pra manter a mesma
 * identidade. Fonte do arquivo e texto alternativo em `content/site.ts` —
 * pra trocar o logo, troque o arquivo em `public/` e o valor de `LOGO` lá,
 * sem tocar neste componente nem nas páginas.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Image
      src={LOGO.src}
      alt={LOGO.alt}
      width={LOGO.width}
      height={LOGO.height}
      priority
      className={`h-10 w-auto ${className}`}
    />
  );
}
