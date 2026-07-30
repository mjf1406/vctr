import type { Id } from "../_generated/dataModel.js";
import type { MutationCtx } from "../_generated/server.js";
import { polar } from "../polar.js";
import { claimTrialGrant } from "./trial.js";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

/**
 * Throws if the user has no active/trialing Polar subscription and their
 * app-managed trial has ended. Safe to call from mutations (`Date.now` OK).
 * Lazily claims a trial grant when the user has an email but no grant yet.
 */
export async function requireEntitlement(ctx: MutationCtx, userId: Id<"users">): Promise<void> {
  const subscription = await polar.getCurrentSubscription(ctx, { userId });
  if (subscription && ACTIVE_STATUSES.has(subscription.status)) {
    return;
  }

  let grant = await ctx.db
    .query("trialGrants")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .unique();

  if (!grant) {
    const user = await ctx.db.get("users", userId);
    if (user?.email) {
      await claimTrialGrant(ctx, userId, user.email);
      grant = await ctx.db
        .query("trialGrants")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .unique();
    }
  }

  if (grant && grant.endsAt > Date.now()) {
    return;
  }

  throw new Error("Subscription required. Your free trial has ended.");
}
