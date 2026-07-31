import { ConvexError, v } from "convex/values";

import { api } from "../_generated/api.js";
import type { Id } from "../_generated/dataModel.js";
import { internalMutation, type ActionCtx } from "../_generated/server.js";
import { authz } from "../authz.js";

/**
 * Require the signed-in user to hold the global unscoped `app_admin` role
 * (permission `admin:syncProducts`).
 */
export async function requireAdmin(ctx: ActionCtx): Promise<{ userId: string; email: string }> {
  const user = await ctx.runQuery(api.users.currentUser, {});
  if (!user?.email) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "Not authenticated",
    });
  }
  const allowed = await authz.can(ctx, user._id, "admin:syncProducts");
  if (!allowed) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return { userId: user._id, email: user.email };
}

/**
 * One-time seeder: grant the global `app_admin` role to a user.
 * Run via: `bunx convex run lib/admin:grantAppAdmin '{"userId":"..."}'`
 */
export const grantAppAdmin = internalMutation({
  args: {
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await ctx.db.get("users", args.userId as Id<"users">);
    if (!user) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    await authz.assignRole(ctx, args.userId, "app_admin");
    return null;
  },
});
