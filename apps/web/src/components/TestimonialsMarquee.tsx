import { Marquee } from "./ui/marquee";

// ============================================================
// "Vertical Testimonials Marquee": 3 colunas de depoimentos subindo/descendo
// sozinhas e sem parar (pausa só ao passar o mouse por cima da coluna).
// Direção alternada coluna a coluna (esquerda sobe, meio desce, direita
// sobe de novo), pedido explícito do usuário — por isso a coluna do meio é
// a única com `reverse`.
//
// Sem foto de perfil: como ainda não existe depoimento real (ver
// `results.testimonials` em content/pages.ts e o comentário em
// `ResultsPlaceholder`, sections.tsx), usar uma foto de banco de imagens
// no lugar da foto de um cliente de verdade seria fabricar prova — mesma
// regra de `features.items[].content`. Por isso o avatar é só a inicial do
// nome, num círculo colorido (like o preview do CTWA / de um contato sem
// foto no CRM de verdade), nunca uma foto genérica fingindo ser alguém.
//
// Só a 1ª coluna aparece abaixo de `lg` (1024px): cada cartão tem largura
// fixa (`w-72`, 288px) pra não espremer o texto, e um item de largura fixa
// dentro de um flex item não encolhe sozinho (o `min-width: auto` padrão
// do flex trava nisso — mesma categoria de bug já corrigida no grid do
// hero, ver VideoHero.tsx). Com 2 ou 3 colunas de 288px lado a lado, a
// soma passa de qualquer celular (e de boa parte dos tablets em pé) bem
// antes de precisar encolher, e vira scroll lateral na página inteira, não
// só dentro do carrossel. Abrir as outras colunas só a partir de `lg`
// (onde 3×288px + os vãos cabem tranquilo) evita o problema na raiz, em
// vez de tentar encolher o cartão ou aceitar corte de conteúdo.
// ============================================================

export interface Testimonial {
  name: string;
  /** Ex.: nome do negócio ou @usuário — opcional, nem todo depoimento tem. */
  handle?: string;
  quote: string;
}

function splitColumns<T>(items: T[], count: number): T[][] {
  const columns: T[][] = Array.from({ length: count }, () => []);
  items.forEach((item, i) => columns[i % count]!.push(item));
  return columns;
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const initial = testimonial.name.trim().charAt(0).toUpperCase();
  return (
    <figure className="w-72 max-w-[85vw] shrink-0 rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/15 text-sm font-bold text-brand">
          {initial}
        </div>
        <figcaption>
          <p className="font-semibold text-ink">{testimonial.name}</p>
          {testimonial.handle ? <p className="text-sm text-mute">{testimonial.handle}</p> : null}
        </figcaption>
      </div>
      <blockquote className="mt-3 text-sm text-mute">“{testimonial.quote}”</blockquote>
    </figure>
  );
}

export function TestimonialsMarquee({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  const columns = splitColumns(testimonials, 3);
  // `reverse` = desce (ver @keyframes marquee-vertical/globals.css): só o
  // meio inverte, pra alternar com as duas colunas vizinhas.
  const reverseByColumn = [false, true, false];

  return (
    <div
      className="relative flex h-[30rem] justify-center gap-4 overflow-hidden"
      style={{ maskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)" }}
    >
      {columns.map((col, i) => (
        <Marquee
          key={i}
          vertical
          pauseOnHover
          reverse={reverseByColumn[i]}
          className={`h-full min-w-0 [--duration:22s] ${i === 0 ? "" : "hidden lg:flex"}`}
        >
          {col.map((t, j) => (
            <TestimonialCard key={j} testimonial={t} />
          ))}
        </Marquee>
      ))}
    </div>
  );
}
