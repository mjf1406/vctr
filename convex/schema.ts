import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { languageValidator } from "./users";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  userSettings: defineTable({
    userId: v.id("users"),
    language: languageValidator,
    homeSectionOrder: v.optional(v.array(v.union(v.literal("schools"), v.literal("classes")))),
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
    .index("by_class", ["classId"]),
});

export default schema;
