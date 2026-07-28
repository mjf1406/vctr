import i18n from "@/i18n";
import { getLanguageOption, isAppLanguage } from "@/lib/languages";

function getAppLocale(): string {
  return isAppLanguage(i18n.language) ? getLanguageOption(i18n.language).htmlLang : i18n.language;
}

export function formatLocalizedDateTime(timestampMs: number): string {
  return new Intl.DateTimeFormat(getAppLocale(), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestampMs));
}

/** Localized relative countdown until `expiresAtMs` (e.g. "in 5 minutes"). */
export function formatCountdownUntil(expiresAtMs: number, nowMs: number): string {
  const rtf = new Intl.RelativeTimeFormat(getAppLocale(), { numeric: "always" });
  const remainingMs = expiresAtMs - nowMs;

  if (remainingMs <= 0) {
    return rtf.format(0, "second");
  }

  const remainingSeconds = Math.floor(remainingMs / 1000);
  if (remainingSeconds < 60) {
    return rtf.format(remainingSeconds, "second");
  }

  const remainingMinutes = Math.floor(remainingSeconds / 60);
  if (remainingMinutes < 60) {
    return rtf.format(remainingMinutes, "minute");
  }

  const remainingHours = Math.floor(remainingMinutes / 60);
  return rtf.format(remainingHours, "hour");
}
