import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { toast } from "@/components/ui/toast-manager";
import { isElectronClassroom } from "@/lib/classroom/classroomSession";
import { isSelfHosted } from "@/lib/selfHosted";
import {
  fetchLatestReleaseVersion,
  getSelfHostAppVersion,
  isNewerSemver,
  selfHostUpgradeDocsUrl,
} from "@/lib/selfHostUpdate";
import { STORAGE_KEYS } from "@/lib/storageKeys";

function readDismissedVersion(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.selfHostUpdateDismissed);
  } catch {
    return null;
  }
}

function writeDismissedVersion(version: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.selfHostUpdateDismissed, version);
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Background advisory for Docker/web self-host: toast when GitHub's latest
 * release is newer than the version baked into the image.
 */
export function useSelfHostUpdateToast(): void {
  const { t } = useTranslation("settings");

  useEffect(() => {
    if (!isSelfHosted() || isElectronClassroom()) {
      return;
    }

    const currentVersion = getSelfHostAppVersion();
    if (!currentVersion) {
      return;
    }

    let cancelled = false;
    let toastId: string | null = null;

    void (async () => {
      const latestVersion = await fetchLatestReleaseVersion();
      if (cancelled || !latestVersion) {
        return;
      }
      if (!isNewerSemver(latestVersion, currentVersion)) {
        return;
      }
      if (readDismissedVersion() === latestVersion) {
        return;
      }

      toastId = toast.add({
        type: "info",
        timeout: 0,
        title: t("selfHostUpdateTitle"),
        description: t("selfHostUpdateDescription", { version: latestVersion }),
        actionProps: {
          children: t("selfHostUpdateAction"),
          onClick: () => {
            window.open(selfHostUpgradeDocsUrl(), "_blank", "noopener,noreferrer");
          },
        },
        onClose: () => {
          // Skip persist when the effect tears down (logout / remount).
          if (!cancelled) {
            writeDismissedVersion(latestVersion);
          }
        },
      });
    })();

    return () => {
      cancelled = true;
      if (toastId) {
        toast.close(toastId);
      }
    };
  }, [t]);
}
