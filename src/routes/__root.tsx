import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import PendingComponent from "@/components/loading/PendingComponent";
import { RootErrorComponent } from "@/components/errors/RootErrorComponent";

export type RouterAuthContext = {
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type RouterContext = {
  auth: RouterAuthContext;
};

export const Route = createRootRouteWithContext<RouterContext>()({
  pendingComponent: PendingComponent,
  errorComponent: RootErrorComponent,
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
