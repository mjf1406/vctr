import { isRateLimitError } from "@convex-dev/rate-limiter";

export function mutationErrorMessage(
  error: unknown,
  fallback: string,
  rateLimitedMessage: string,
): string {
  if (isRateLimitError(error)) {
    return rateLimitedMessage;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}
