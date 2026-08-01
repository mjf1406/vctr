import { lazy, Suspense, type ComponentType } from "react";

/**
 * Dev-only TanStack Query inspector.
 * Gated on `import.meta.env.DEV` so Vite/Rolldown tree-shakes the package from
 * production builds (cloud, Electron, and self-hosted all use `vp build`).
 */
const ReactQueryDevtools: ComponentType | null = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((m) => ({
        default: m.ReactQueryDevtools,
      })),
    )
  : null;

export function QueryDevtools() {
  if (!ReactQueryDevtools) {
    return null;
  }
  return (
    <Suspense fallback={null}>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </Suspense>
  );
}
