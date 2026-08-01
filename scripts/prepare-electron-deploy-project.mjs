/**
 * Copy convex/ + install deps into resources/deploy-project for packaged first-run deploy.
 */
import { $ } from "bun";
import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const out = path.join("resources", "deploy-project");
await rm(out, { recursive: true, force: true });
await mkdir(path.join(out, "scripts"), { recursive: true });

await cp("convex", path.join(out, "convex"), { recursive: true });
await cp("patches", path.join(out, "patches"), { recursive: true });
await cp("package.json", path.join(out, "package.json"));
await cp("bun.lock", path.join(out, "bun.lock"));
await cp("tsconfig.json", path.join(out, "tsconfig.json"));
await cp("tsconfig.app.json", path.join(out, "tsconfig.app.json"));
await cp("scripts/self-host-bootstrap.mjs", path.join(out, "scripts", "self-host-bootstrap.mjs"));

await writeFile(path.join(out, ".gitignore"), "node_modules\n", "utf8");

console.log("Installing deploy-project dependencies...");
await $`bun install --frozen-lockfile --ignore-scripts`.cwd(out);
console.log(`Deploy project ready at ${out}`);
