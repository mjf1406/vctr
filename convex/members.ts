import { v } from "convex/values";

import { APP_CONFIG } from "./appConfig.js";
import { authz } from "./authz.js";
import { components } from "./_generated/api.js";
import type { Id } from "./_generated/dataModel.js";
import type { MutationCtx, QueryCtx } from "./_generated/server.js";
import {
  JOIN_CODE_ROLES,
  classScope,
  isClassRole,
  isJoinCodeRole,
  MEMBER_LIST_AUTHZ_ROLES,
  MEMBER_LIST_READ_PERMISSION_BY_ROLE,
  pickHighestClassRole,
  REMOVE_PERMISSION_BY_ROLE,
  SUSPEND_PERMISSION_BY_ROLE,
  type MemberListRole,
} from "./lib/authzModel.js";
import { classQuery, entitledClassMutation } from "./lib/customFunctions.js";
import { rateLimiter } from "./lib/rateLimiter.js";

const memberListRoleValidator = v.union(
  v.literal("teacher"),
  v.literal("assistant_teacher"),
  v.literal("student"),
  v.literal("guardian"),
);

const classMemberRoleValidator = v.union(
  v.literal("owner"),
  v.literal("teacher"),
  v.literal("assistant_teacher"),
  v.literal("student"),
  v.literal("guardian"),
);

type ListedClassRole = "owner" | "teacher" | "assistant_teacher" | "student" | "guardian";

const classMemberValidator = v.object({
  userId: v.id("users"),
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  email: v.optional(v.string()),
  role: classMemberRoleValidator,
});

const memberCountsValidator = v.object({
  teacher: v.union(v.number(), v.null()),
  assistant_teacher: v.union(v.number(), v.null()),
  student: v.union(v.number(), v.null()),
  guardian: v.union(v.number(), v.null()),
});

async function countUsersForListRole(
  ctx: QueryCtx | MutationCtx,
  classId: Id<"classes">,
  listRole: MemberListRole,
): Promise<number> {
  const scope = classScope(classId);
  const userIds = new Set<string>();
  for (const authzRole of MEMBER_LIST_AUTHZ_ROLES[listRole]) {
    const users = await ctx.runQuery(components.authz.queries.getUsersWithRole, {
      tenantId: APP_CONFIG.authzTenantId,
      role: authzRole,
      scope,
    });
    for (const entry of users) {
      userIds.add(entry.userId);
    }
  }
  return userIds.size;
}

/**
 * Suspend / unsuspend a class member via a scoped deny override ("*").
 * Role assignment is preserved; unsuspend removes the override.
 */
export const setSuspended = entitledClassMutation({
  args: {
    userId: v.id("users"),
    suspended: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await rateLimiter.limit(ctx, "memberSuspend", { key: ctx.userId, throws: true });
    if (args.userId === ctx.userId) {
      throw new Error("You cannot suspend yourself");
    }

    const targetRoles = await authz.getUserRoles(ctx, args.userId, ctx.scope);
    const role = pickHighestClassRole(
      targetRoles.map((entry: { role: string }) => entry.role).filter(isClassRole),
    );
    if (!role) {
      throw new Error("Person is not in this class");
    }

    const permission = SUSPEND_PERMISSION_BY_ROLE[role];
    if (!permission) {
      throw new Error("This person cannot be suspended");
    }
    await ctx.require(permission);

    if (args.suspended) {
      await authz.denyPermission(ctx, args.userId, "*", ctx.scope, "Suspended from class");
    } else {
      await authz.removeOverride(ctx, args.userId, "*", ctx.scope);
    }
    return null;
  },
});

/**
 * List members for a people page (teachers includes owners).
 * Class people lists are intentionally small / classroom-sized.
 */
export const listByRole = classQuery({
  args: {
    role: memberListRoleValidator,
  },
  returns: v.array(classMemberValidator),
  handler: async (ctx, args) => {
    if (!isJoinCodeRole(args.role)) {
      throw new Error("Invalid member list role");
    }
    const listRole: MemberListRole = args.role;
    await ctx.require(MEMBER_LIST_READ_PERMISSION_BY_ROLE[listRole]);

    const authzRoles = MEMBER_LIST_AUTHZ_ROLES[listRole];
    const byUserId = new Map<string, ListedClassRole>();

    for (const authzRole of authzRoles) {
      const users = await ctx.runQuery(components.authz.queries.getUsersWithRole, {
        tenantId: APP_CONFIG.authzTenantId,
        role: authzRole,
        scope: ctx.scope,
      });
      for (const entry of users) {
        const existing = byUserId.get(entry.userId);
        const next = pickHighestClassRole([...(existing ? [existing] : []), authzRole]);
        if (
          next === "owner" ||
          next === "teacher" ||
          next === "assistant_teacher" ||
          next === "student" ||
          next === "guardian"
        ) {
          byUserId.set(entry.userId, next);
        }
      }
    }

    const members: Array<{
      userId: Id<"users">;
      name?: string;
      image?: string;
      email?: string;
      role: ListedClassRole;
    }> = [];
    for (const [userId, role] of byUserId) {
      const user = await ctx.db.get("users", userId as Id<"users">);
      if (!user) continue;
      members.push({
        userId: user._id,
        name: user.name,
        image: user.image,
        email: user.email,
        role,
      });
    }

    members.sort((a, b) => {
      const roleRank = (role: ListedClassRole) => (role === "owner" ? 0 : 1);
      const byRole = roleRank(a.role) - roleRank(b.role);
      if (byRole !== 0) return byRole;
      const nameA = (a.name ?? a.email ?? a.userId).toLocaleLowerCase();
      const nameB = (b.name ?? b.email ?? b.userId).toLocaleLowerCase();
      return nameA.localeCompare(nameB);
    });

    return members;
  },
});

/**
 * Sidebar counts per people-list role.
 * Returns null for roles the viewer cannot read.
 */
export const countsByRole = classQuery({
  args: {},
  returns: memberCountsValidator,
  handler: async (ctx) => {
    const counts: {
      teacher: number | null;
      assistant_teacher: number | null;
      student: number | null;
      guardian: number | null;
    } = {
      teacher: null,
      assistant_teacher: null,
      student: null,
      guardian: null,
    };

    for (const listRole of JOIN_CODE_ROLES) {
      const allowed = await ctx.can(MEMBER_LIST_READ_PERMISSION_BY_ROLE[listRole]);
      if (!allowed) continue;
      counts[listRole] = await countUsersForListRole(ctx, ctx.classDoc._id, listRole);
    }

    return counts;
  },
});

/**
 * Remove a class member by offboarding their scoped authz membership.
 */
export const remove = entitledClassMutation({
  args: {
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await rateLimiter.limit(ctx, "memberRemove", { key: ctx.userId, throws: true });
    if (args.userId === ctx.userId) {
      throw new Error("You cannot remove yourself");
    }

    const targetRoles = await authz.getUserRoles(ctx, args.userId, ctx.scope);
    const role = pickHighestClassRole(
      targetRoles.map((entry: { role: string }) => entry.role).filter(isClassRole),
    );
    if (!role) {
      throw new Error("Person is not in this class");
    }

    const permission = REMOVE_PERMISSION_BY_ROLE[role];
    if (!permission) {
      throw new Error("This person cannot be removed");
    }
    await ctx.require(permission);

    await authz.offboardUser(ctx, args.userId, {
      scope: ctx.scope,
      removeOverrides: true,
      removeRelationships: true,
      removeAttributes: false,
    });
    return null;
  },
});
