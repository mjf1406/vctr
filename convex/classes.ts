import { v } from "convex/values";

import { authedMutation, authedQuery } from "./lib/customFunctions.js";
import { rateLimiter } from "./lib/rateLimiter.js";
import type { Doc, Id } from "./_generated/dataModel.js";
import type { MutationCtx } from "./_generated/server.js";

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_ICON_LENGTH = 32;

const classValidator = v.object({
  _id: v.id("classes"),
  _creationTime: v.number(),
  ownerId: v.id("users"),
  name: v.string(),
  year: v.number(),
  description: v.optional(v.string()),
  icon: v.optional(v.string()),
  updatedAt: v.number(),
  archivedAt: v.optional(v.number()),
});

function normalizeName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Class name is required");
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    throw new Error(`Class name must be at most ${MAX_NAME_LENGTH} characters`);
  }
  return trimmed;
}

function normalizeYear(year: number): number {
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    throw new Error(`Year must be an integer between ${MIN_YEAR} and ${MAX_YEAR}`);
  }
  return year;
}

function normalizeDescription(description: string | undefined): string | undefined {
  if (description === undefined) {
    return undefined;
  }
  const trimmed = description.trim();
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(`Description must be at most ${MAX_DESCRIPTION_LENGTH} characters`);
  }
  return trimmed;
}

function normalizeIcon(icon: string | undefined): string | undefined {
  if (icon === undefined) {
    return undefined;
  }
  const trimmed = icon.trim();
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.length > MAX_ICON_LENGTH) {
    throw new Error(`Icon must be at most ${MAX_ICON_LENGTH} characters`);
  }
  const isFontAwesome = /^(fas|far):[a-z0-9-]+$/i.test(trimmed);
  // Allow a single grapheme emoji (or short emoji sequence) as an alternative to FA ids.
  const isEmoji = !trimmed.includes(":") && /\p{Extended_Pictographic}/u.test(trimmed);
  if (!isFontAwesome && !isEmoji) {
    throw new Error("Icon must be a Font Awesome id or emoji");
  }
  return trimmed;
}

function deleteConfirmationPhrase(name: string): string {
  return `delete ${name}`;
}

async function requireOwnedClass(
  ctx: MutationCtx,
  classId: Id<"classes">,
  userId: Id<"users">,
): Promise<Doc<"classes">> {
  const classDoc = await ctx.db.get("classes", classId);
  if (!classDoc) {
    throw new Error("Class not found");
  }
  if (classDoc.ownerId !== userId) {
    throw new Error("Unauthorized");
  }
  return classDoc;
}

export const listMine = authedQuery({
  args: {},
  returns: v.array(classValidator),
  handler: async (ctx) => {
    // Owner-scoped list is bounded per user; collect is intentional.
    // eslint-disable-next-line @convex-dev/no-collect-in-query -- per-owner class lists stay small
    return await ctx.db
      .query("classes")
      .withIndex("by_owner", (q) => q.eq("ownerId", ctx.userId))
      .collect();
  },
});

export const get = authedQuery({
  args: { classId: v.id("classes") },
  returns: v.union(classValidator, v.null()),
  handler: async (ctx, args) => {
    const classDoc = await ctx.db.get("classes", args.classId);
    if (!classDoc || classDoc.ownerId !== ctx.userId) {
      return null;
    }
    return classDoc;
  },
});

export const create = authedMutation({
  args: {
    name: v.string(),
    year: v.number(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  returns: classValidator,
  handler: async (ctx, args) => {
    await rateLimiter.limit(ctx, "classCreate", { key: ctx.userId, throws: true });
    const now = Date.now();
    const classId = await ctx.db.insert("classes", {
      ownerId: ctx.userId,
      name: normalizeName(args.name),
      year: normalizeYear(args.year),
      description: normalizeDescription(args.description),
      icon: normalizeIcon(args.icon),
      updatedAt: now,
    });
    const created = await ctx.db.get("classes", classId);
    if (!created) {
      throw new Error("Failed to create class");
    }
    return created;
  },
});

export const update = authedMutation({
  args: {
    classId: v.id("classes"),
    name: v.string(),
    year: v.number(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  returns: classValidator,
  handler: async (ctx, args) => {
    await rateLimiter.limit(ctx, "classUpdate", { key: ctx.userId, throws: true });
    await requireOwnedClass(ctx, args.classId, ctx.userId);
    await ctx.db.patch("classes", args.classId, {
      name: normalizeName(args.name),
      year: normalizeYear(args.year),
      description: normalizeDescription(args.description),
      icon: normalizeIcon(args.icon),
      updatedAt: Date.now(),
    });
    const updated = await ctx.db.get("classes", args.classId);
    if (!updated) {
      throw new Error("Failed to update class");
    }
    return updated;
  },
});

export const setArchived = authedMutation({
  args: {
    classId: v.id("classes"),
    archived: v.boolean(),
  },
  returns: classValidator,
  handler: async (ctx, args) => {
    await rateLimiter.limit(ctx, "classArchive", { key: ctx.userId, throws: true });
    await requireOwnedClass(ctx, args.classId, ctx.userId);
    await ctx.db.patch("classes", args.classId, {
      archivedAt: args.archived ? Date.now() : undefined,
      updatedAt: Date.now(),
    });
    const updated = await ctx.db.get("classes", args.classId);
    if (!updated) {
      throw new Error("Failed to update class archive state");
    }
    return updated;
  },
});

export const remove = authedMutation({
  args: {
    classId: v.id("classes"),
    confirmation: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await rateLimiter.limit(ctx, "classDelete", { key: ctx.userId, throws: true });
    const classDoc = await requireOwnedClass(ctx, args.classId, ctx.userId);
    const expected = deleteConfirmationPhrase(classDoc.name);
    if (args.confirmation !== expected) {
      throw new Error(`Type "${expected}" to confirm deletion`);
    }
    await ctx.db.delete("classes", args.classId);
    return null;
  },
});
