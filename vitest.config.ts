import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["ingestion/**/*.test.ts", "checks/**/*.test.ts"] },
});
