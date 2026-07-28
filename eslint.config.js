import { defineConfig } from "eslint/config";
import pluginQuery from "@tanstack/eslint-plugin-query";
import convexPlugin from "@convex-dev/eslint-plugin";

export default defineConfig([
  // Other configurations
  ...pluginQuery.configs["flat/recommended"],
  ...convexPlugin.configs.recommended,
]);
