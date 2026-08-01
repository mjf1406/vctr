import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { AppUpdateSettingsCard } from "@/components/classroom/AppUpdateSettingsCard";
import { SelfHostVersionCard } from "@/components/classroom/SelfHostVersionCard";
import { LanguageSelect } from "@/components/i18n/LanguageSelect";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardPocket,
  CardTitle,
} from "@/components/ui/card";
import { useAppLanguage } from "@/i18n/language-context";

export const Route = createFileRoute("/_authenticated/_app/settings")({
  component: function SettingsPage() {
    const { t } = useTranslation(["settings", "common"]);
    const { language, setLanguage, isSaving } = useAppLanguage();

    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("languageLabel")}</CardTitle>
            <CardDescription id="language-description">{t("languageDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSelect
              value={language}
              onValueChange={setLanguage}
              disabled={isSaving}
              triggerClassName="w-auto min-w-40"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("themeLabel")}</CardTitle>
            <CardDescription id="theme-description">{t("themeDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <CardPocket tone="secondary" className="flex justify-end">
              <ThemeToggle descriptionId="theme-description" />
            </CardPocket>
          </CardContent>
        </Card>

        <SelfHostVersionCard />
        <AppUpdateSettingsCard />
      </div>
    );
  },
});
