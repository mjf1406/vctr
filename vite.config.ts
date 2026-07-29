import { defineConfig, lazyPlugins } from "vite-plus";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  run: {
    tasks: {
      "dev:web": {
        command: "vp dev",
        cache: false,
      },
      "dev:convex": {
        command: "bunx convex dev",
        cache: false,
      },
      ds: {
        command: "echo Both stopped.",
        dependsOn: ["dev:web", "dev:convex"],
        cache: false,
      },
    },
  },
  staged: {
    // vp staged does not use a shell, so `cmd1 && cmd2` passes later tokens
    // (including eslint's `--fix`) into the first command. Keep tasks separate.
    // Also avoid `vp check --fix`: it forwards `--fix` to Oxfmt, which wants `--write`.
    "*": "vp fmt --write",
    "*.{ts,tsx,js,jsx}": "bunx eslint --fix",
  },
  fmt: {},
  check: {
    lint: false,
  },
  plugins: lazyPlugins(() => [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] }),
  ]),
});
