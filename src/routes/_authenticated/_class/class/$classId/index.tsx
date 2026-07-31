import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { RequirePermission } from "@/components/permissions/RequirePermission";
import { Skeleton } from "@/components/ui/skeleton";
import { useClass } from "@/hooks/classes/useClass";
import { useFileBytes } from "@/hooks/files/useFileBytes";
import type { Id } from "../../../../../convex/_generated/dataModel";

export const Route = createFileRoute("/_authenticated/_class/class/$classId/")({
  component: function ClassDashboardPage() {
    const { classId } = Route.useParams();
    const { t } = useTranslation("classes");
    const { data: classDoc } = useClass(classId as Id<"classes">);
    const bannerFileId = classDoc?.bannerFileId;
    const { url: bannerUrl, isPending: bannerPending } = useFileBytes(bannerFileId);

    return (
      <RequirePermission permission="class:read">
        <div className="flex w-full flex-col gap-4 px-4 py-8 sm:px-8">
          {bannerFileId ? (
            bannerPending || !bannerUrl ? (
              <Skeleton className="aspect-[3/1] w-full max-w-4xl rounded-xl" />
            ) : (
              <img
                src={bannerUrl}
                alt={t("bannerPreviewAlt")}
                className="aspect-[3/1] w-full max-w-4xl rounded-xl object-cover"
              />
            )
          ) : null}
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{t("navDashboard")}</h1>
            <p className="text-sm text-muted-foreground">{t("comingSoon")}</p>
          </div>
        </div>
      </RequirePermission>
    );
  },
});
