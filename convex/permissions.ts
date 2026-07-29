import { v } from "convex/values";

import { classScope } from "./lib/authzModel.js";
import { authedQuery } from "./lib/customFunctions.js";
import { permissionSnapshotForScope } from "./lib/permissionSnapshot.js";

const classRoleValidator = v.union(
  v.literal("owner"),
  v.literal("teacher"),
  v.literal("assistant_teacher"),
  v.literal("student"),
  v.literal("guardian"),
  v.literal("class_member"),
);

/**
 * Effective permission snapshot for the current user in a class.
 * Used by UI gating (sidebar, action menus, page guards).
 */
export const forClass = authedQuery({
  args: { classId: v.id("classes") },
  returns: v.object({
    role: v.union(classRoleValidator, v.null()),
    permissions: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const classDoc = await ctx.db.get("classes", args.classId);
    if (!classDoc) {
      return { role: null, permissions: [] };
    }
    return await permissionSnapshotForScope(ctx, ctx.userId, classScope(args.classId));
  },
});
