import { customMutation, customQuery } from "convex-helpers/server/customFunctions";

import { mutation, query } from "../_generated/server.js";
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
