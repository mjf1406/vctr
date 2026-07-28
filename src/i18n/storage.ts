import { APP_CONFIG } from "@/config/app";
import { isAppLanguage, type AppLanguage } from "@/lib/languages";

const LANGUAGE_STORAGE_KEY = `${APP_CONFIG.slug}-language`;

function readLanguage(key: string): AppLanguage | null {
  try {
    const value = window.localStorage.getItem(key);
    return isAppLanguage(value) ? value : null;
  } catch {
    return null;
  }
}

function writeLanguage(key: string, language: AppLanguage): void {
  try {
    window.localStorage.setItem(key, language);
  } catch {
    // Language switching should still work when storage is unavailable.
  }
}

export function readStoredLanguage(): AppLanguage | null {
  return readLanguage(LANGUAGE_STORAGE_KEY);
}

export function writeStoredLanguage(language: AppLanguage): void {
  writeLanguage(LANGUAGE_STORAGE_KEY, language);
}
