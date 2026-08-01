import { useEffect } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";

import { AdminUsersPage } from "@/components/admin/AdminUsersPage";
import PendingComponent from "@/components/loading/PendingComponent";
import { useIsAppAdmin } from "@/hooks/admin/useIsAppAdmin";
import { isSelfHosted } from "@/lib/selfHosted";

export const Route = createFileRoute("/_authenticated/_app/admin")({
  beforeLoad: () => {
    if (!isSelfHosted()) {
      throw redirect({ to: "/" });
    }
  },
  component: function AdminRoute() {
    const navigate = useNavigate();
    const { isAdmin, isPending, isAuthLoading } = useIsAppAdmin();

    useEffect(() => {
      if (isPending || isAuthLoading) return;
      if (!isAdmin) {
        void navigate({ to: "/" });
      }
    }, [isAdmin, isAuthLoading, isPending, navigate]);

    if (isPending || isAuthLoading) {
      return <PendingComponent inset />;
    }
    if (!isAdmin) {
      return null;
    }
    return <AdminUsersPage />;
  },
});
