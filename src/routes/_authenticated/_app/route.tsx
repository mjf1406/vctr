import { Navbar } from "@/components/navigation/NavBar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_app")({
  component: function AppLayout() {
    return (
      <>
        <Navbar />
        <Outlet />
      </>
    );
  },
});
