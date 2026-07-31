import { lazy, Suspense } from "react";

const TanStackRouterDevtools = lazy(() =>
  import("@tanstack/react-router-devtools").then((m) => ({
    default: m.TanStackRouterDevtools,
  })),
);

/** Dev-only router inspector. Tree-shaken out of production via import.meta.env.DEV. */
export function RouterDevtools() {
  if (!import.meta.env.DEV) {
    return null;
  }
  return (
    <Suspense fallback={null}>
      <TanStackRouterDevtools />
    </Suspense>
  );
}
