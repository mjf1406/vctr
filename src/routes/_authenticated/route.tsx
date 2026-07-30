import PendingComponent from "@/components/loading/PendingComponent";
import { relativeLocationHref, stashPendingJoinCode } from "@/lib/auth/pendingJoinCode";
import { JOIN_CODE_PARAM } from "@/lib/invitations/joinCodes";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    if (context.auth.isLoading) {
      return;
    }
    if (!context.auth.isAuthenticated) {
      // Preserve join codes across login: OAuth/redirect may drop query params.
      if (location.pathname === "/join") {
        const code = new URLSearchParams(location.searchStr).get(JOIN_CODE_PARAM);
        if (code) {
          stashPendingJoinCode(code);
        }
      }
      throw redirect({
        to: "/login",
        search: { redirect: relativeLocationHref(location) },
      });
    }
  },
  component: function AuthenticatedLayout() {
    const { auth } = Route.useRouteContext();

    if (!auth.isLoading && !auth.isAuthenticated) {
      return null;
    }

    return auth.isLoading ? <PendingComponent inset /> : <Outlet />;
  },
});
