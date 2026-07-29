import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ClassAppSidebar } from "@/components/navigation/class-sidebar/ClassSidebar";
import { ClassBreadcrumb } from "@/components/navigation/class-sidebar/ClassBreadcrumb";
import { ClassPermissionsProvider } from "@/components/permissions/ClassPermissionsProvider";
import PendingComponent from "@/components/loading/PendingComponent";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useClass } from "@/hooks/classes/useClass";
import type { Id } from "../../../../../../convex/_generated/dataModel";

export const Route = createFileRoute("/_authenticated/_class/class/$classId")({
  component: function ClassLayout() {
    const { classId: classIdParam } = Route.useParams();
    const classId = classIdParam as Id<"classes">;
    const { data: classDoc, isPending, isError, refetch } = useClass(classId);
    const { t } = useTranslation("classes");
    const { t: tCommon } = useTranslation("common");

    if (isPending) {
      return <PendingComponent />;
    }

    if (isError || !classDoc) {
      return (
        <main className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-8">
          <Empty card>
            <EmptyHeader>
              <EmptyTitle>{t("classNotFound")}</EmptyTitle>
              <EmptyDescription>{tCommon("notFoundDescription")}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent className="flex flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => void refetch()}>
                {tCommon("tryAgain")}
              </Button>
              <Button type="button" nativeButton={false} render={<Link to="/" />}>
                {tCommon("goHome")}
              </Button>
            </EmptyContent>
          </Empty>
        </main>
      );
    }

    return (
      <ClassPermissionsProvider classId={classId}>
        <SidebarProvider className="min-h-svh">
          <ClassAppSidebar classDoc={classDoc} />
          <SidebarInset>
            <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <ClassBreadcrumb classDoc={classDoc} />
            </header>
            <div className="flex flex-1 flex-col">
              <Outlet />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ClassPermissionsProvider>
    );
  },
});
