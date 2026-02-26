import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/test-setup.ts", "src/**/*.test.{ts,tsx}", "src/main.tsx"],
      thresholds: {
        lines: 3,
        branches: 10,
        functions: 10,
        statements: 3,
      },
    },
  },
});
