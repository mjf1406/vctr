import {
  definePermissions,
  defineRoles,
  flattenRolePermissions,
  type PermissionString,
} from "@djpanda/convex-authz";

/**
 * Single source of truth for class permissions and roles.
 * No Convex imports — safe to import from `src/` at runtime (same pattern as appConfig).
 */

export const permissions = definePermissions({
  class: { read: true, update: true, archive: true, delete: true },
  activity: { read: true },
  teachers: { read: true, invite: true, remove: true, suspend: true },
  assistantTeachers: { read: true, invite: true, remove: true, suspend: true },
  students: { read: true, add: true, remove: true, suspend: true },
  guardians: { read: true, invite: true, remove: true, suspend: true },
  invitations: { read: true, create: true, revoke: true },
});

export const roles = defineRoles(permissions, {
  class_member: { class: ["read"] },
  student: { inherits: "class_member" },
  guardian: { inherits: "class_member" },
  assistant_teacher: {
    inherits: "class_member",
    activity: ["read"],
    teachers: ["read"],
    assistantTeachers: ["read"],
    students: ["read"],
    guardians: ["read"],
  },
  teacher: {
    inherits: "assistant_teacher",
    class: ["update", "archive"],
    students: ["add", "remove", "suspend"],
    guardians: ["invite", "remove", "suspend"],
    assistantTeachers: ["invite", "remove", "suspend"],
    invitations: ["read", "create", "revoke"],
  },
  owner: {
    inherits: "teacher",
    class: ["delete"],
    teachers: ["invite", "remove", "suspend"],
  },
});

export type ClassPermission = PermissionString<typeof permissions>;
export type ClassRole = keyof typeof roles;

export const CLASS_ROLES = Object.keys(roles) as Array<ClassRole>;

/** Privilege order for resolving a single display role when multiple are assigned. */
export const CLASS_ROLE_RANK: Record<ClassRole, number> = {
  owner: 60,
  teacher: 50,
  assistant_teacher: 40,
  student: 30,
  guardian: 30,
  class_member: 10,
};

export function classScope(classId: string) {
  return { type: "class", id: classId } as const;
}

export function permissionsForRole(role: ClassRole): Array<string> {
  return flattenRolePermissions(roles, role);
}

export function isClassRole(value: string): value is ClassRole {
  return Object.prototype.hasOwnProperty.call(roles, value);
}

export function pickHighestClassRole(roleNames: Array<string>): ClassRole | null {
  let best: ClassRole | null = null;
  let bestRank = -1;
  for (const name of roleNames) {
    if (!isClassRole(name)) continue;
    const rank = CLASS_ROLE_RANK[name];
    if (rank > bestRank) {
      best = name;
      bestRank = rank;
    }
  }
  return best;
}

/** Which permission gates suspending a member, based on the target's role. */
export const SUSPEND_PERMISSION_BY_ROLE = {
  owner: null,
  teacher: "teachers:suspend",
  assistant_teacher: "assistantTeachers:suspend",
  student: "students:suspend",
  guardian: "guardians:suspend",
  class_member: null,
} as const satisfies Record<ClassRole, ClassPermission | null>;
