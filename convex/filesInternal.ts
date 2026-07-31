import { v } from "convex/values";

import { internal } from "./_generated/api.js";
import { internalMutation } from "./_generated/server.js";

const ORPHAN_AGE_MS = 60 * 60 * 1000;
const PAGE_SIZE = 100;

/**
 * Delete Convex storage blobs older than one hour that have no matching `files` row.
 * Covers abandoned uploads where the client never called finalizeUpload.
 */
export const purgeOrphanedStorage = internalMutation({
  args: {
    cursor: v.optional(v.union(v.string(), v.null())),
    deleted: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    let deleted = args.deleted ?? 0;
    const page = await ctx.db.system.query("_storage").paginate({
      numItems: PAGE_SIZE,
      cursor: args.cursor ?? null,
    });

    for (const blob of page.page) {
      if (now - blob._creationTime < ORPHAN_AGE_MS) {
        continue;
      }
      const registered = await ctx.db
        .query("files")
        .withIndex("by_storageId", (q) => q.eq("storageId", blob._id))
        .unique();
      if (registered) {
        continue;
      }
      await ctx.storage.delete(blob._id);
      deleted += 1;
    }

    if (!page.isDone) {
      await ctx.scheduler.runAfter(0, internal.filesInternal.purgeOrphanedStorage, {
        cursor: page.continueCursor,
        deleted,
      });
    }

    return null;
  },
});
