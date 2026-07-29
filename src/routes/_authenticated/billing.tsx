import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { ImageSkeleton } from "@/components/ui/image-skeleton";

export const Route = createFileRoute("/_authenticated/billing")({
  component: function BillingPage() {
    const { t } = useTranslation("billing");

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8 text-center">
        <ImageSkeleton
          src="/img/under-construction.webp"
          alt={t("title")}
          width={320}
          height={320}
          className="rounded-xl"
        />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="max-w-md text-sm text-muted-foreground">{t("comingSoon")}</p>
        </div>
      </div>
    );
  },
});
