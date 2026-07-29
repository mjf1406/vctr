import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_authenticated/account")({
  component: function AccountPage() {
    const { t } = useTranslation("account");

    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-medium">{t("paymentsTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("paymentsComingSoon")}</p>
        </div>
      </div>
    );
  },
});
