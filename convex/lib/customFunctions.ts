import { v } from "convex/values";
import { customMutation, customQuery } from "convex-helpers/server/customFunctions";

import { mutation, query } from "../_generated/server.js";
import { authz } from "../authz.js";
import type { ClassPermission } from "./authzModel.js";
import { classScope } from "./authzModel.js";
import { requireAuthUserId } from "./auth.js";

/**
 * Mutation wrapper that requires authentication.
 * Soft-auth queries (empty/null when logged out) should keep using plain `query`.
 */
export const authedMutation = customMutation(mutation, {
  args: {},
  input: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    return { ctx: { ...ctx, userId }, args: {} };
  },
});

/**
 * Query wrapper that requires authentication.
 *
 * This should be used for queries that should never run while logged out.
 * Client-side, use `useAuthedQuery` to avoid calling the query with "skip".
 */
export const authedQuery = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const userId = await requireAuthUserId(ctx);
    return { ctx: { ...ctx, userId }, args: {} };
  },
});

/**
 * Class-scoped mutation: loads the class, injects scope + can/require helpers.
 * Callers still enforce the specific permission they need via `ctx.require(...)`.
 */
export const classMutation = customMutation(authedMutation, {
  args: { classId: v.id("classes") },
  input: async (ctx, args) => {
    const classDoc = await ctx.db.get("classes", args.classId);
    if (!classDoc) {
      throw new Error("Class not found");
    }
    const scope = classScope(args.classId);
    return {
      ctx: {
        ...ctx,
        classDoc,
        scope,
        can: (permission: ClassPermission) => authz.can(ctx, ctx.userId, permission, scope),
        require: (permission: ClassPermission) => authz.require(ctx, ctx.userId, permission, scope),
      },
      args: {},
    };
  },
});

/**
 * Class-scoped query: loads the class, injects scope + can/require helpers.
 * Returns null classDoc path is not used — throws if the class row is missing.
 * Soft-deny (e.g. no class:read) should still be handled in the handler via `ctx.can`.
 */
export const classQuery = customQuery(authedQuery, {
  args: { classId: v.id("classes") },
  input: async (ctx, args) => {
    const classDoc = await ctx.db.get("classes", args.classId);
    if (!classDoc) {
      throw new Error("Class not found");
    }
    const scope = classScope(args.classId);
    return {
      ctx: {
        ...ctx,
        classDoc,
        scope,
        can: (permission: ClassPermission) => authz.can(ctx, ctx.userId, permission, scope),
        require: (permission: ClassPermission) => authz.require(ctx, ctx.userId, permission, scope),
      },
      args: {},
    };
  },
});
