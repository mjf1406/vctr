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
});

export default schema;
