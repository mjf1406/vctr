import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { languageValidator } from "./lib/languages.js";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  userSettings: defineTable({
    userId: v.id("users"),
    language: languageValidator,
  }).index("by_userId", ["userId"]),
  classes: defineTable({
    ownerId: v.id("users"),
    name: v.string(),
    year: v.number(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    updatedAt: v.number(),
    archivedAt: v.optional(v.number()),
  }).index("by_owner", ["ownerId"]),
  joinCodes: defineTable({
    code: v.string(),
    classId: v.id("classes"),
    createdBy: v.id("users"),
    role: v.union(
      v.literal("teacher"),
      v.literal("assistant_teacher"),
      v.literal("student"),
      v.literal("guardian"),
    ),
    expiresAt: v.number(),
    maxUses: v.number(),
    useCount: v.number(),
    expirationJobId: v.optional(v.id("_scheduled_functions")),
  })
    .index("by_code", ["code"])
    .index("by_class", ["classId"])
    .index("by_creator", ["createdBy"]),
  /**
   * One card-less trial grant per normalized email.
   * Survives account delete/recreate — never re-grant for the same emailKey.
   */
  trialGrants: defineTable({
    emailKey: v.string(),
    /** Cleared on account deletion; reattached on re-signup via emailKey. */
    userId: v.optional(v.id("users")),
    startedAt: v.number(),
    endsAt: v.number(),
  })
    .index("by_emailKey", ["emailKey"])
    .index("by_userId", ["userId"]),
});

export default schema;
