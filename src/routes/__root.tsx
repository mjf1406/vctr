import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import PendingComponent from "@/components/loading/PendingComponent";

export const Route = createRootRoute({
  pendingComponent: PendingComponent,
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
