import type { PageConfig, PageId } from "@/content/pages";
import { Blocks } from "./blocks";
import { Faq } from "./Faq";
import { HeroCta } from "./HeroCta";
import { cn } from "@/lib/utils";

type Section = PageConfig["sections"][number];

/** Barrinha da marca acima de cada título de seção. */
function Heading({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <>
      <span aria-hidden="true" className={cn("mb-5 block h-1 w-10 rounded-full bg-brand", center && "mx-auto")} />
      <h2 className={cn("mb-6 text-2xl leading-snug font-bold sm:text-3xl", center && "text-center")}>{children}</h2>
    </>
  );
}

/**
 * Seções depois do formulário, na ordem em que estão em `content/pages.ts`.
 * As de conteúdo alternam entre fundo liso e uma faixa levemente destacada,
 * para dar ritmo à leitura longa sem mudar de tela.
 */
export function PageSections({ sections, page, formId }: { sections: Section[]; page: PageId; formId: string }) {
  let contentIndex = 0;
  return (
    <>
      {sections.map((s) => {
        switch (s.kind) {
          case "content": {
            const band = contentIndex++ % 2 === 1;
            return (
              <section
                key={s.id}
                id={s.id}
                className={cn(band && "border-y border-line/40 bg-surface/25")}
              >
                <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
                  <Heading>{s.heading}</Heading>
                  <Blocks blocks={s.blocks} />
                </div>
              </section>
            );
          }
          case "steps":
            return (
              <section key={s.id} id={s.id}>
                <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
                  <Heading>{s.heading}</Heading>
                  <ol>
                    {s.items.map((step, i) => {
                      const last = i === s.items.length - 1;
                      return (
                        <li key={step.title} className="relative flex gap-5">
                          {!last && <span aria-hidden="true" className="absolute top-14 bottom-0 left-7 w-px -translate-x-1/2 bg-line" />}
                          <div
                            aria-hidden="true"
                            className="relative z-10 grid size-14 shrink-0 place-items-center rounded-xl border border-line bg-bg text-xl font-bold text-brand"
                          >
                            {i + 1}
                          </div>
                          <div className={cn("pt-2.5", !last && "pb-9")}>
                            <h3 className="text-lg leading-snug font-bold">{step.title}</h3>
                            <div className="mt-1.5 space-y-2">
                              {step.lines.map((line) => (
                                <p key={line} className="text-base leading-relaxed text-mute">
                                  {line}
                                </p>
                              ))}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                  <div className="mt-10 flex justify-center">
                    <HeroCta label={s.cta} targetSelector={`#${formId}`} page={page} location={s.id} />
                  </div>
                </div>
              </section>
            );
          case "faq":
            return <Faq key={s.id} heading={s.heading} items={s.items} page={page} />;
          case "cta":
            return (
              <section key={s.id} id={s.id}>
                <div className="mx-auto max-w-2xl px-5 pt-8 pb-16 text-center sm:pb-24">
                  <Heading center>{s.heading}</Heading>
                  <Blocks blocks={s.blocks} center />
                  <div className="mt-8 flex justify-center">
                    <HeroCta label={s.cta} targetSelector={`#${formId}`} page={page} location={s.id} />
                  </div>
                </div>
              </section>
            );
        }
      })}
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line/60">
      <div className="mx-auto max-w-6xl px-5 py-4 text-center text-sm text-mute sm:py-6">
        © RCO Hub. Todos os direitos reservados.
      </div>
    </footer>
  );
}
