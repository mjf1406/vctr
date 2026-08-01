type VitePublicEnvKey =
  | "VITE_CONVEX_URL"
  | "VITE_CONVEX_SITE_URL"
  | "VITE_AUTH_PASSWORD_ENABLED"
  | "VITE_SELF_HOSTED";

type SelfHostRuntimeEnv = Partial<Record<VitePublicEnvKey, string>>;

declare global {
  interface Window {
    __SELF_HOST_ENV__?: SelfHostRuntimeEnv;
  }
}

/**
 * Prefer Docker/nginx-injected `window.__SELF_HOST_ENV__` (self-host),
 * then fall back to Vite build-time `import.meta.env`.
 */
export function readViteEnv(key: VitePublicEnvKey): string | undefined {
  const runtime = typeof window !== "undefined" ? window.__SELF_HOST_ENV__?.[key] : undefined;
  if (typeof runtime === "string" && runtime.length > 0) {
    return runtime;
  }
  const baked = import.meta.env[key];
  return typeof baked === "string" && baked.length > 0 ? baked : undefined;
}
