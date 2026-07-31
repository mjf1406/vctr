import { ConvexError } from "convex/values";

import type { Id } from "../_generated/dataModel.js";
import type { MutationCtx } from "../_generated/server.js";
import { polar } from "../polar.js";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

/**
 * Throws if the user has no active/trialing Polar subscription and their
 * app-managed trial has ended. Read-only — does not claim a trial grant.
 * Safe to call from mutations (`Date.now` OK).
 */
export async function assertEntitled(ctx: MutationCtx, userId: Id<"users">): Promise<void> {
  const subscription = await polar.getCurrentSubscription(ctx, { userId });
  if (subscription && ACTIVE_STATUSES.has(subscription.status)) {
    return;
  }

  const grant = await ctx.db
    .query("trialGrants")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();

  if (grant && grant.endsAt > Date.now()) {
    return;
  }

  throw new ConvexError({
    code: "SUBSCRIPTION_REQUIRED",
    message: "Subscription required. Your free trial has ended.",
  });
}

/** @deprecated Prefer `assertEntitled` — kept as an alias during migration. */
export const requireEntitlement = assertEntitled;
