import path from "node:path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      routesDirectory: "./src/routes",
      autoCodeSplitting: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
  // @ts-expect-error - vitestの型定義が含まれている
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "**/__tests__/**",
        "**/*.test.tsx",
        "**/*.test.ts",
        "**/test/**",
        "**/vite.config.ts",
        "**/vitest.config.ts",
        "**/tailwind.config.js",
        "**/postcss.config.js",
        "src/routeTree.gen.ts",
        "src/vite-env.d.ts",
      ],
    },
  },
});
