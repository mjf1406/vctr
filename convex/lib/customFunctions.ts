import { customMutation } from "convex-helpers/server/customFunctions";

import { mutation } from "../_generated/server.js";
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
