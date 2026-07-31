import { ConvexError, v } from "convex/values";

import { api, internal } from "./_generated/api.js";
import { action } from "./_generated/server.js";
import { entitledMutation } from "./lib/customFunctions.js";
import { rateLimiter } from "./lib/rateLimiter.js";
import {
  detectContentType,
  getUploadPresetDefinition,
  isUploadPresetKey,
  validateDetectedContentType,
} from "./lib/uploadPresets.js";

const uploadPresetKeyValidator = v.union(
  v.literal("images"),
  v.literal("documents"),
  v.literal("audio"),
);

/**
 * Create a short-lived upload URL for Convex storage.
 *
 * Requires an active trial or subscription and is rate-limited.
 * The client should POST the raw file bytes to this URL and expect a JSON
 * response like: `{ storageId: "..." }`, then call `finalizeUpload`.
 */
export const generateUploadUrl = entitledMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await rateLimiter.limit(ctx, "fileUploadUrlGlobal", { key: "global", throws: true });
    await rateLimiter.limit(ctx, "fileUploadUrl", { key: ctx.userId, throws: true });
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Validate (magic bytes + size + quota) and register an uploaded blob.
 * Runs as an action so it can read blob bytes for content sniffing.
 */
export const finalizeUpload = action({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    preset: uploadPresetKeyValidator,
  },
  returns: v.id("files"),
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.currentUser, {});
    if (!user) {
      throw new ConvexError({
        code: "UNAUTHENTICATED",
        message: "Not authenticated",
      });
    }

    await ctx.runMutation(internal.lib.rateLimitActions.consume, {
      name: "fileFinalizeGlobal",
      key: "global",
    });
    await ctx.runMutation(internal.lib.rateLimitActions.consume, {
      name: "fileFinalize",
      key: user._id,
    });

    if (!isUploadPresetKey(args.preset)) {
      await ctx.storage.delete(args.storageId);
      throw new ConvexError({
        code: "INVALID_UPLOAD",
        message: "Invalid upload preset",
      });
    }

    const blob = await ctx.storage.get(args.storageId);
    if (!blob) {
      throw new ConvexError({
        code: "UPLOAD_NOT_FOUND",
        message: "Upload not found",
      });
    }

    const size = blob.size;
    if (size > getUploadPresetDefinition(args.preset).maxSizeBytes) {
      await ctx.storage.delete(args.storageId);
      throw new ConvexError({
        code: "INVALID_UPLOAD_SIZE",
        message: "File exceeds the maximum allowed size",
      });
    }

    const sample = new Uint8Array(await blob.slice(0, 64).arrayBuffer());
    const detected = detectContentType(sample);
    if (validateDetectedContentType(args.preset, detected) !== null || !detected) {
      await ctx.storage.delete(args.storageId);
      throw new ConvexError({
        code: "INVALID_UPLOAD_CONTENT",
        message: "File content does not match an allowed type",
      });
    }

    return await ctx.runMutation(internal.filesInternal.registerFinalizedUpload, {
      storageId: args.storageId,
      name: args.name,
      preset: args.preset,
      contentType: detected,
      size,
    });
  },
});

/**
 * Return file bytes for a file the caller owns.
 * Ownership is re-checked on every call via `getOwnedFile`.
 */
export const getFileBytes = action({
  args: {
    fileId: v.id("files"),
  },
  returns: v.union(
    v.object({
      bytes: v.bytes(),
      contentType: v.string(),
      name: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const file = await ctx.runQuery(internal.filesInternal.getOwnedFile, {
      fileId: args.fileId,
    });
    if (!file) {
      return null;
    }
    const blob = await ctx.storage.get(file.storageId);
    if (!blob) {
      return null;
    }
    const buffer = await blob.arrayBuffer();
    return {
      bytes: buffer,
      contentType: file.contentType,
      name: file.name,
    };
  },
});

/**
 * Delete a file the caller owns (row + storage blob).
 */
export const deleteFile = entitledMutation({
  args: {
    fileId: v.id("files"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await rateLimiter.limit(ctx, "fileDelete", { key: ctx.userId, throws: true });
    const file = await ctx.db.get("files", args.fileId);
    if (!file || file.userId !== ctx.userId) {
      throw new ConvexError({
        code: "UPLOAD_FORBIDDEN",
        message: "File not found or access denied",
      });
    }
    await ctx.storage.delete(file.storageId);
    await ctx.db.delete("files", args.fileId);
    return null;
  },
});
