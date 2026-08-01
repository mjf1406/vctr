import { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { APP_CONFIG } from "@/config/app";
import {
  dismissSelfHostUpdate,
  remindLaterSelfHostUpdate,
  useSelfHostUpdateAvailable,
} from "@/hooks/useSelfHostUpdateAvailable";
import { selfHostUpgradeDocsUrl } from "@/lib/selfHostUpdate";
import { cn } from "@/lib/utils";

/** Persistent banner under the navbar when a newer self-host release is available. */
export function SelfHostUpdateBanner() {
  const { t } = useTranslation("settings");
  const { currentVersion, availableVersion, showBanner } = useSelfHostUpdateAvailable();
  const [hidden, setHidden] = useState(false);

  if (!showBanner || !availableVersion || !currentVersion || hidden) {
    return null;
  }

  return (
    <div className="border-b bg-background px-4 py-3">
      <Alert className="mx-auto max-w-4xl">
        <AlertTitle>{t("selfHostUpdateTitle")}</AlertTitle>
        <AlertDescription>
          {t("selfHostUpdateDescription", {
            current: currentVersion,
            version: availableVersion,
          })}
        </AlertDescription>
        <AlertAction className="flex flex-wrap items-center gap-2">
          <a
            href={selfHostUpgradeDocsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            {t("selfHostUpdateAction")}
          </a>
          <a
            href={APP_CONFIG.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {t("selfHostUpdateReleaseNotes")}
          </a>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              remindLaterSelfHostUpdate(availableVersion);
              setHidden(true);
            }}
          >
            {t("selfHostUpdateRemindLater")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("selfHostUpdateDismiss")}
            onClick={() => {
              dismissSelfHostUpdate(availableVersion);
              setHidden(true);
            }}
          >
            <X />
          </Button>
        </AlertAction>
      </Alert>
    </div>
  );
}
