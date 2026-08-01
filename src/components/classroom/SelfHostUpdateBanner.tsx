import { useState } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  dismissSelfHostUpdate,
  useSelfHostUpdateAvailable,
} from "@/hooks/useSelfHostUpdateAvailable";
import { selfHostUpgradeDocsUrl } from "@/lib/selfHostUpdate";
import { cn } from "@/lib/utils";

/** Persistent banner under the navbar when a newer self-host release is available. */
export function SelfHostUpdateBanner() {
  const { t } = useTranslation("settings");
  const latestVersion = useSelfHostUpdateAvailable();
  const [dismissed, setDismissed] = useState(false);

  if (!latestVersion || dismissed) {
    return null;
  }

  return (
    <div className="border-b bg-background px-4 py-3">
      <Alert className="mx-auto max-w-4xl">
        <AlertTitle>{t("selfHostUpdateTitle")}</AlertTitle>
        <AlertDescription>
          {t("selfHostUpdateDescription", { version: latestVersion })}
        </AlertDescription>
        <AlertAction className="flex items-center gap-2">
          <a
            href={selfHostUpgradeDocsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            {t("selfHostUpdateAction")}
          </a>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("selfHostUpdateDismiss")}
            onClick={() => {
              dismissSelfHostUpdate(latestVersion);
              setDismissed(true);
            }}
          >
            <X />
          </Button>
        </AlertAction>
      </Alert>
    </div>
  );
}
