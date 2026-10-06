import Link from "next/link";
import { PAGES, PAGE_IDS } from "@/content/pages";

/** Índice de desenvolvimento. Antes de publicar, decidir o que a raiz deve mostrar. */
export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-20">
      <h1 className="text-3xl font-extrabold">RCO Hub · páginas</h1>
      <p className="mt-2 text-mute">Índice de desenvolvimento.</p>
      <ul className="mt-8 space-y-3">
        {PAGE_IDS.map((id) => (
          <li key={id}>
            <Link
              href={PAGES[id].path}
              className="block rounded-2xl border border-line bg-surface p-5 transition hover:border-brand"
            >
              <span className="font-bold">{id}</span> · {PAGES[id].formName}
              <span className="mt-1 block text-sm text-mute">{PAGES[id].path}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
