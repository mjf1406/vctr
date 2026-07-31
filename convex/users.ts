import { getAuthSessionId, getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

import { query } from "./_generated/server.js";
import { listLinkedProviders } from "./lib/accountDeletion.js";
import { authedMutation, authedQuery } from "./lib/customFunctions.js";
import { languageValidator } from "./lib/languages.js";
import { rateLimiter } from "./lib/rateLimiter.js";

export { languageValidator };

const userSettingsValidator = v.object({
  _id: v.id("userSettings"),
  _creationTime: v.number(),
  userId: v.id("users"),
  language: languageValidator,
});

const currentUserValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  email: v.optional(v.string()),
  emailVerificationTime: v.optional(v.number()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),
  isAnonymous: v.optional(v.boolean()),
  settings: v.union(userSettingsValidator, v.null()),
  providers: v.array(v.string()),
});

const currentSessionValidator = v.object({
  _id: v.id("authSessions"),
  _creationTime: v.number(),
  userId: v.id("users"),
  expirationTime: v.number(),
});

export const currentUser = query({
  args: {},
  returns: v.union(currentUserValidator, v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }
    const user = await ctx.db.get("users", userId);
    if (!user) {
      return null;
    }
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    const providers = await listLinkedProviders(ctx, userId);
    return {
      ...user,
      settings: settings ?? null,
      providers,
    };
  },
});

export const currentSession = authedQuery({
  args: {},
  returns: v.union(currentSessionValidator, v.null()),
  handler: async (ctx) => {
    const sessionId = await getAuthSessionId(ctx);
    if (sessionId === null) {
      return null;
    }
    return await ctx.db.get("authSessions", sessionId);
  },
});

export const updateLanguage = authedMutation({
  args: {
    language: languageValidator,
  },
  returns: userSettingsValidator,
  handler: async (ctx, args) => {
    await rateLimiter.limit(ctx, "updateLanguage", { key: ctx.userId, throws: true });
    const userId = ctx.userId;

    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existing) {
      await ctx.db.patch("userSettings", existing._id, { language: args.language });
      const updated = await ctx.db.get("userSettings", existing._id);
      if (!updated) {
        throw new Error("Failed to update language settings");
      }
      return updated;
    }

    const settingsId = await ctx.db.insert("userSettings", {
      userId,
      language: args.language,
    });
    const created = await ctx.db.get("userSettings", settingsId);
    if (!created) {
      throw new Error("Failed to create language settings");
    }
    return created;
  },
});
