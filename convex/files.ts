import { v } from "convex/values";

import { authedMutation } from "./lib/customFunctions.js";

/**
 * Create a short-lived upload URL for Convex storage.
 *
 * The client should POST the raw file bytes to this URL and expect a JSON
 * response like: `{ storageId: "..." }`.
 */
export const generateUploadUrl = authedMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
