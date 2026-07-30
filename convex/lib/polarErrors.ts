import { ConvexError } from "convex/values";

type PolarLikeError = {
  name?: string;
  error?: string;
  detail?: string;
  message?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Pull Polar's stable error code from SDK / Convex-wrapped failures. */
export function polarErrorCode(error: unknown): string | undefined {
  if (!isRecord(error)) {
    return undefined;
  }

  const named = typeof error.name === "string" ? error.name : undefined;
  const coded = typeof error.error === "string" ? error.error : undefined;
  if (coded && coded.trim()) {
    return coded;
  }
  if (named && named !== "Error" && named !== "PolarError") {
    return named;
  }

  const message = typeof error.message === "string" ? error.message : "";
  const fromMessage =
    /AlreadyCanceledSubscription|AlreadyActiveSubscriptionError|SubscriptionLocked|NotPermitted|ResourceNotFound/.exec(
      message,
    );
  return fromMessage?.[0];
}

export function isAlreadyCanceledError(error: unknown): boolean {
  return polarErrorCode(error) === "AlreadyCanceledSubscription";
}

/**
 * Convert Polar / unexpected billing failures into a stable ConvexError.
 * Keeps raw SDK dumps out of the client toast path.
 */
export function throwBillingError(
  error: unknown,
  fallbackCode: string,
  fallbackMessage: string,
): never {
  const code = polarErrorCode(error) ?? fallbackCode;
  const polar = isRecord(error) ? (error as PolarLikeError) : undefined;
  const detail =
    (typeof polar?.detail === "string" && polar.detail.trim()) ||
    (typeof polar?.message === "string" && !polar.message.includes("{")
      ? polar.message.trim()
      : undefined);

  console.error("Billing action failed", {
    code,
    detail: detail ?? (error instanceof Error ? error.message : String(error)),
  });

  throw new ConvexError({
    code,
    message: detail && detail.length < 160 ? detail : fallbackMessage,
  });
}
