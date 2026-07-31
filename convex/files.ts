import { v } from "convex/values";

import { entitledMutation } from "./lib/customFunctions.js";
import { rateLimiter } from "./lib/rateLimiter.js";

/**
 * Create a short-lived upload URL for Convex storage.
 *
 * Requires an active trial or subscription and is rate-limited.
 * The client should POST the raw file bytes to this URL and expect a JSON
 * response like: `{ storageId: "..." }`.
 *
 * TODO: When uploads ship for real product use, add a storage ownership
 * registry (`storageId` → `userId`) and a finalize mutation that validates
 * size/MIME, then delete orphans on account deletion.
 */
export const generateUploadUrl = entitledMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await rateLimiter.limit(ctx, "fileUploadUrl", { key: ctx.userId, throws: true });
    return await ctx.storage.generateUploadUrl();
  },
});
