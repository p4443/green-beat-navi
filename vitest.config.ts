import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // tsconfig の paths("@/*" → "./src/*")と揃える
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
