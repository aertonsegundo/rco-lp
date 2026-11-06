import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Servida na raiz de crm.rcohub.com.br (como o build publicado).
  base: "/",
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
