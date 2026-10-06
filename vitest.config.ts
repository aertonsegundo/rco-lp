import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "jsdom", testTimeout: 20000, exclude: ["**/node_modules/**", "lp-crm/**", "lps/**"] },
});
