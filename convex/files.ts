import { ConvexError, v } from "convex/values";

import { entitledMutation, entitledQuery } from "./lib/customFunctions.js";
import { rateLimiter } from "./lib/rateLimiter.js";
import { isUploadPresetKey, validateUploadAgainstPreset } from "./lib/uploadPresets.js";

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
    await rateLimiter.limit(ctx, "fileUploadUrl", { key: ctx.userId, throws: true });
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Validate and register an uploaded blob in the ownership registry.
 * Deletes the blob and throws when size/MIME fail validation.
 */
export const finalizeUpload = entitledMutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
    preset: uploadPresetKeyValidator,
  },
  returns: v.id("files"),
  handler: async (ctx, args) => {
    await rateLimiter.limit(ctx, "fileFinalize", { key: ctx.userId, throws: true });

    if (!isUploadPresetKey(args.preset)) {
      await ctx.storage.delete(args.storageId);
      throw new ConvexError({
        code: "INVALID_UPLOAD",
        message: "Invalid upload preset",
      });
    }

    const existing = await ctx.db
      .query("files")
      .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
      .unique();
    if (existing) {
      if (existing.userId !== ctx.userId) {
        throw new ConvexError({
          code: "UPLOAD_FORBIDDEN",
          message: "File already registered",
        });
      }
      return existing._id;
    }

    const metadata = await ctx.db.system.get("_storage", args.storageId);
    if (!metadata) {
      throw new ConvexError({
        code: "UPLOAD_NOT_FOUND",
        message: "Upload not found",
      });
    }

    const validationError = validateUploadAgainstPreset(args.preset, {
      size: metadata.size,
      contentType: metadata.contentType,
    });
    if (validationError) {
      await ctx.storage.delete(args.storageId);
      throw new ConvexError({
        code: validationError === "invalid_size" ? "INVALID_UPLOAD_SIZE" : "INVALID_UPLOAD_TYPE",
        message:
          validationError === "invalid_size"
            ? "File exceeds the maximum allowed size"
            : "File type is not allowed",
      });
    }

    const name = args.name.trim().slice(0, 255) || "file";
    return await ctx.db.insert("files", {
      storageId: args.storageId,
      userId: ctx.userId,
      name,
      contentType: metadata.contentType ?? "application/octet-stream",
      size: metadata.size,
      preset: args.preset,
      createdAt: Date.now(),
    });
  },
});

/**
 * Return a short-lived URL for a file the caller owns.
 */
export const getFileUrl = entitledQuery({
  args: {
    fileId: v.id("files"),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const file = await ctx.db.get("files", args.fileId);
    if (!file || file.userId !== ctx.userId) {
      return null;
    }
    return await ctx.storage.getUrl(file.storageId);
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
