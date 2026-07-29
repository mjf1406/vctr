import { Navbar } from "@/components/navigation/NavBar";
import PendingComponent from "@/components/loading/PendingComponent";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    if (context.auth.isLoading) {
      return;
    }
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: function AuthenticatedLayout() {
    const { auth } = Route.useRouteContext();

    if (!auth.isLoading && !auth.isAuthenticated) {
      return null;
    }

    return (
      <>
        <Navbar />
        {auth.isLoading ? <PendingComponent inset /> : <Outlet />}
      </>
    );
  },
});
