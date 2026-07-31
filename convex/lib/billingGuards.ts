import { ConvexError } from "convex/values";

import { APP_CONFIG } from "../appConfig.js";
import { POLAR_ENV } from "./polarEnv.js";

/**
 * Reject product IDs that are not the configured monthly/yearly plans.
 */
export function assertConfiguredProduct(productId: string): void {
  const allowed = new Set(
    [POLAR_ENV.monthlyProductId, POLAR_ENV.yearlyProductId].filter((id) => id.length > 0),
  );
  if (!allowed.has(productId)) {
    throw new ConvexError({
      code: "INVALID_PRODUCT",
      message: "Unknown product",
    });
  }
}

/**
 * App origin for Polar redirect / embed URLs.
 * Prefers `SITE_URL` (dev localhost or deployed SPA) over the production brand URL.
 */
export function resolveAppOrigin(): string {
  const siteUrl = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (siteUrl) {
    return siteUrl;
  }
  return APP_CONFIG.appUrl.replace(/\/$/, "");
}

/** Build an absolute same-app URL from a path (must start with `/`). */
export function resolveAppUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${resolveAppOrigin()}${normalized}`;
}
