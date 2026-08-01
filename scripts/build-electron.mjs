/**
 * Bundle Electron main + preload into dist-electron/.
 */
import { $ } from "bun";
import { mkdir } from "node:fs/promises";

await mkdir("dist-electron", { recursive: true });

// Use ./electron/... so bun does not confuse the path with the `electron` package.
await $`bun build ./electron/main.ts --outdir ./dist-electron --target=node --format=esm --packages=external`;
await $`bun build ./electron/preload.ts --outdir ./dist-electron --target=browser --format=cjs --packages=external`;

console.log("Electron main/preload built → dist-electron/");
