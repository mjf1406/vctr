import { useTranslation } from "react-i18next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isElectronClassroom } from "@/lib/classroom/classroomSession";
import { isSelfHosted } from "@/lib/selfHosted";
import { getSelfHostAppVersion } from "@/lib/selfHostUpdate";

/** Shows the baked-in app version for Docker/web self-host (not Electron). */
export function SelfHostVersionCard() {
  const { t } = useTranslation("settings");
  const version = getSelfHostAppVersion();

  if (!isSelfHosted() || isElectronClassroom() || !version) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("selfHostVersionLabel")}</CardTitle>
        <CardDescription>{t("selfHostVersionDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{t("updateCurrentVersion", { version })}</p>
      </CardContent>
    </Card>
  );
}
