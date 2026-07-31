import { v } from "convex/values";

import { internalMutation } from "./_generated/server.js";

/**
 * Flip `expiredAt` when a trial grant reaches `endsAt`.
 * Re-checks the deadline so a rescheduled/extended grant is never wrongly expired.
 */
export const markExpired = internalMutation({
  args: {
    grantId: v.id("trialGrants"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const grant = await ctx.db.get("trialGrants", args.grantId);
    if (!grant) {
      return null;
    }
    if (grant.expiredAt !== undefined) {
      return null;
    }
    const now = Date.now();
    if (grant.endsAt > now) {
      return null;
    }
    await ctx.db.patch("trialGrants", args.grantId, { expiredAt: now });
    return null;
  },
});
