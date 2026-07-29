import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

/**
 * Join-code redemption UI depends on class invite modules that are not in this
 * branch yet. Keep the authenticated route + localized shell so the auth gate
 * and i18n catalogs stay complete.
 */
export const Route = createFileRoute("/_authenticated/_app/join")({
  component: function JoinPage() {
    const { t } = useTranslation("classes");

    useEffect(() => {
      document.title = t("joinPageTitle");
    }, [t]);

    return (
      <div className="mx-auto w-full max-w-md p-4 sm:p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("joinPageTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("joinPageDescription")}</p>
        </div>
      </div>
    );
  },
});
