import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export const Route = createFileRoute("/_authenticated/_app/settings")({
  component: function SettingsPage() {
    const { t } = useTranslation(["settings", "common"]);

    return (
      <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-medium">{t("languageLabel")}</h2>
          <p id="language-description" className="text-sm text-muted-foreground">
            {t("languageDescription")}
          </p>
          <LanguageSwitcher descriptionId="language-description" />
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-medium">{t("themeLabel")}</h2>
          <p id="theme-description" className="text-sm text-muted-foreground">
            {t("themeDescription")}
          </p>
          <ThemeToggle descriptionId="theme-description" />
        </div>
      </div>
    );
  },
});
