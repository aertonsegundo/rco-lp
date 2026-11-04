import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vitest/config";
import { transformHtml } from "./src/render.ts";

/** Injeta a marca (src/brand.ts) nos marcadores <!-- opale:... --> e {{produto}} do HTML. */
function opaleHtml(): Plugin {
  return { name: "opale-html", transformIndexHtml: (html) => transformHtml(html) };
}

export default defineConfig({
  // Servida na raiz de crm.rcohub.com.br (como o build publicado).
  base: "/",
  plugins: [opaleHtml()],
  build: {
    target: "es2019",
    // O JS publicado (public/assets) já traz o polyfill de modulepreload.
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: {
        lp: resolve(import.meta.dirname, "index.html"),
        obrigado: resolve(import.meta.dirname, "obrigado/index.html"),
      },
    },
  },
  test: { environment: "jsdom", include: ["src/**/*.test.ts"] },
});
