import { v } from "convex/values";

import { authz } from "./authz.js";
import { isClassRole, pickHighestClassRole, SUSPEND_PERMISSION_BY_ROLE } from "./lib/authzModel.js";
import { classMutation } from "./lib/customFunctions.js";

/**
 * Suspend / unsuspend a class member via a scoped deny override ("*").
 * Role assignment is preserved; unsuspend removes the override.
 */
export const setSuspended = classMutation({
  args: {
    userId: v.id("users"),
    suspended: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.userId === ctx.userId) {
      throw new Error("You cannot suspend yourself");
    }

    const targetRoles = await authz.getUserRoles(ctx, args.userId, ctx.scope);
    const role = pickHighestClassRole(
      targetRoles.map((entry: { role: string }) => entry.role).filter(isClassRole),
    );
    if (!role) {
      throw new Error("Person is not in this class");
    }

    const permission = SUSPEND_PERMISSION_BY_ROLE[role];
    if (!permission) {
      throw new Error("This person cannot be suspended");
    }
    await ctx.require(permission);

    if (args.suspended) {
      await authz.denyPermission(ctx, args.userId, "*", ctx.scope, "Suspended from class");
    } else {
      await authz.removeOverride(ctx, args.userId, "*", ctx.scope);
    }
    return null;
  },
});
