import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/navigation/NavBar";

export const Route = createFileRoute("/_public")({
  component: () => (
    <>
      <Navbar />
      <Outlet />
    </>
  ),
});
