import { readViteEnv } from "@/lib/runtimeEnv";

/** True when running the Docker self-host stack (runtime or build flag). */
export function isSelfHosted(): boolean {
  return readViteEnv("VITE_SELF_HOSTED") === "true";
}
