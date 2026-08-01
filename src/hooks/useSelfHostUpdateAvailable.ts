import { useEffect, useState } from "react";

import { isElectronClassroom } from "@/lib/classroom/classroomSession";
import { isSelfHosted } from "@/lib/selfHosted";
import {
  fetchLatestReleaseVersion,
  getSelfHostAppVersion,
  isNewerSemver,
} from "@/lib/selfHostUpdate";
import { STORAGE_KEYS } from "@/lib/storageKeys";

function readDismissedVersion(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.selfHostUpdateDismissed);
  } catch {
    return null;
  }
}

/**
 * Background advisory for Docker/web self-host: latest GitHub release when it's
 * newer than the version baked into the image (and not dismissed).
 */
export function useSelfHostUpdateAvailable(): string | null {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);

  useEffect(() => {
    if (!isSelfHosted() || isElectronClassroom()) {
      return;
    }

    const currentVersion = getSelfHostAppVersion();
    if (!currentVersion) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const remoteVersion = await fetchLatestReleaseVersion();
      if (cancelled || !remoteVersion) {
        return;
      }
      if (!isNewerSemver(remoteVersion, currentVersion)) {
        return;
      }
      if (readDismissedVersion() === remoteVersion) {
        return;
      }
      setLatestVersion(remoteVersion);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return latestVersion;
}

export function dismissSelfHostUpdate(version: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.selfHostUpdateDismissed, version);
  } catch {
    // ignore quota / private mode
  }
}
