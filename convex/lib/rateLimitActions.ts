import { ConvexError, v } from "convex/values";

import { internalMutation } from "../_generated/server.js";
import { rateLimiter, type RateLimitName } from "./rateLimiter.js";

const rateLimitNameValidator = v.union(
  v.literal("billingCheckout"),
  v.literal("billingPortal"),
  v.literal("billingChange"),
  v.literal("billingCancel"),
  v.literal("billingOrders"),
);

/**
 * Consume a rate-limit bucket from an action via `ctx.runMutation`.
 * The rate-limiter component requires a mutation context.
 */
export const consume = internalMutation({
  args: {
    name: rateLimitNameValidator,
    key: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await rateLimiter.limit(ctx, args.name as RateLimitName, {
      key: args.key,
      throws: true,
    });
    return null;
  },
});

export function isRateLimitError(error: unknown): boolean {
  if (!(error instanceof ConvexError)) {
    return false;
  }
  const data = error.data;
  if (typeof data === "object" && data !== null && "kind" in data) {
    return (data as { kind?: string }).kind === "RateLimited";
  }
  return false;
}
