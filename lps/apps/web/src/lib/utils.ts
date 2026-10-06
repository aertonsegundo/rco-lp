import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Junta classes do Tailwind resolvendo conflito (ex.: duas classes de
 *  padding) a favor da última. Convenção padrão do shadcn/ui, usada pelos
 *  componentes em `components/ui/`. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
