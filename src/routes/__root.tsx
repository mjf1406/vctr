import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import { QueryDevtools } from "@/components/dev/QueryDevtools";
import { RouterDevtools } from "@/components/dev/RouterDevtools";
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
      <RouterDevtools />
      <QueryDevtools />
    </>
  ),
});
