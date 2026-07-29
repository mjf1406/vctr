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
});

export default schema;
