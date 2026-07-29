/**
 * TEMPLATE: Single brand config — change these when cloning.
 * Brand image assets live under public/brand/.
 * `name` is never translated — i18n uses it via defaultVariables.appName.
 */
export const APP_CONFIG = {
  name: "ClassClarus",
  /** Storage keys and package-name check. */
  slug: "classclarus",
  /** Appended after name in the document title (`Name | suffix`). */
  titleSuffix: "App",
  /** Canonical app origin (printed join URLs, production deep links). */
  appUrl: "https://app.classclarus.com",
  marketingUrl: "https://www.classclarus.com",
  privacyUrl: "https://www.classclarus.com/privacy-policy",
  termsUrl: "https://www.classclarus.com/terms-and-conditions",
  cookieUrl: "https://www.classclarus.com/cookie-policy",
  /** Product-level authz namespace — set before first real deploy; rematerialize if changed later. */
  authzTenantId: "classclarus",
  /** Browser chrome — hex (meta theme-color is unreliable with oklch). */
  themeColors: {
    light: "#ffffff",
    /** Match `.dark --background` feel (oklch 0.145 ≈ #252525). */
    dark: "#252525",
  },
  /** Keep aligned with page background. */
  backgroundColors: {
    light: "#ffffff",
    dark: "#252525",
  },
} as const;
