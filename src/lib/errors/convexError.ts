import { ConvexError } from "convex/values";
import { isRateLimitError } from "@convex-dev/rate-limiter";

type ForbiddenData = {
  code?: string;
  message?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Prefer ConvexError.data.message (e.g. authz FORBIDDEN), then Error.message, then fallback.
 * Optionally maps rate-limit errors to a localized string.
 */
export function messageFromError(
  error: unknown,
  fallback: string,
  rateLimitedMessage?: string,
): string {
  if (rateLimitedMessage !== undefined && isRateLimitError(error)) {
    return rateLimitedMessage;
  }

  if (error instanceof ConvexError) {
    const data = error.data as ForbiddenData | string;
    if (typeof data === "string" && data.trim()) {
      return data;
    }
    if (isRecord(data) && typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  }

  if (isRecord(error) && "data" in error) {
    const data = error.data;
    if (isRecord(data) && typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
