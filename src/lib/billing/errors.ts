import { codeFromError, messageFromError } from "@/lib/errors/convexError";

const BILLING_ERROR_KEYS = {
  AlreadyCanceledSubscription: "errorAlreadyCanceled",
  AlreadyActiveSubscriptionError: "errorAlreadyActive",
  SubscriptionLocked: "errorSubscriptionLocked",
  CANCEL_FAILED: "cancelFailed",
  CHANGE_FAILED: "changeFailed",
  ORDERS_FAILED: "ordersLoadFailed",
  PORTAL_FAILED: "portalFailed",
  UNAUTHENTICATED: "errorUnauthenticated",
} as const;

type BillingErrorKey = (typeof BILLING_ERROR_KEYS)[keyof typeof BILLING_ERROR_KEYS];

/**
 * Map Polar / billing ConvexError codes to localized billing strings.
 * Falls back to the human message, then a generic failure string.
 */
export function billingMessageFromError(
  error: unknown,
  t: (key: BillingErrorKey | string) => string,
  fallback: string,
  rateLimitedMessage?: string,
): string {
  const code = codeFromError(error);
  if (code && code in BILLING_ERROR_KEYS) {
    return t(BILLING_ERROR_KEYS[code as keyof typeof BILLING_ERROR_KEYS]);
  }

  return messageFromError(error, fallback, rateLimitedMessage);
}
