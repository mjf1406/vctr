import { defineConfig, lazyPlugins } from "vite-plus";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import type { Plugin } from "vite";

import { APP_CONFIG } from "./convex/appConfig";

/** Keep FOUC theme bootstrap in index.html aligned with STORAGE_KEYS.theme. */
function injectAppThemeStorageKey(): Plugin {
  const themeStorageKey = `${APP_CONFIG.slug}-ui-theme`;
  return {
    name: "inject-app-theme-storage-key",
    transformIndexHtml(html) {
      return html.replaceAll("%APP_THEME_STORAGE_KEY%", themeStorageKey);
    },
  };
}

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
  plugins: lazyPlugins(() => {
    const plugins: Plugin[] = [
      injectAppThemeStorageKey(),
      tanstackRouter({
        target: "react",
        autoCodeSplitting: true,
      }),
      react(),
      tailwindcss(),
    ];
    // React Compiler + Babel is memory-heavy; Docker/Portainer builds often OOM (exit 134).
    if (process.env.DISABLE_REACT_COMPILER !== "true") {
      plugins.push(babel({ presets: [reactCompilerPreset()] }));
    }
    return plugins;
  }),
  build: {
    // Slightly lower peak RAM during Docker image builds.
    reportCompressedSize: false,
    sourcemap: false,
  },
});
