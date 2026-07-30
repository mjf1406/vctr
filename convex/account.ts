import { ConvexError, v } from "convex/values";

import { authedMutation, authedQuery } from "./lib/customFunctions.js";
import {
  accountDeleteConfirmationPhrase,
  deleteAccountData,
  getAccountDeletionBlockers,
} from "./lib/accountDeletion.js";
import { rateLimiter } from "./lib/rateLimiter.js";

const deletionBlockerValidator = v.union(
  v.literal("owns_classes"),
  v.literal("active_subscription"),
);

export const getDeletionBlockers = authedQuery({
  args: {},
  returns: v.array(deletionBlockerValidator),
  handler: async (ctx) => {
    return await getAccountDeletionBlockers(ctx, ctx.userId);
  },
});

export const deleteAccount = authedMutation({
  args: {
    confirmation: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await rateLimiter.limit(ctx, "accountDelete", { key: ctx.userId, throws: true });

    const user = await ctx.db.get("users", ctx.userId);
    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const expected = accountDeleteConfirmationPhrase(user.email);
    if (args.confirmation !== expected) {
      throw new ConvexError({
        code: "CONFIRMATION_MISMATCH",
        message: `Type "${expected}" to confirm deletion`,
      });
    }

    await deleteAccountData(ctx, ctx.userId);
    return null;
  },
});
