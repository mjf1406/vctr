import type { Id } from "../../../convex/_generated/dataModel";
import type { ClassRole, MemberListRole } from "@/lib/permissions/classPermissions";
import { REMOVE_PERMISSION_BY_ROLE } from "@/lib/permissions/classPermissions";

export type ClassMemberPublic = {
  userId: Id<"users">;
  name?: string;
  image?: string;
  email?: string;
  role: Extract<ClassRole, "owner" | "teacher" | "assistant_teacher" | "student" | "guardian">;
};

export type ClassMemberCounts = {
  teacher: number | null;
  assistant_teacher: number | null;
  student: number | null;
  guardian: number | null;
};

export type { MemberListRole };

export function removePermissionForMember(
  role: ClassMemberPublic["role"],
): (typeof REMOVE_PERMISSION_BY_ROLE)[ClassMemberPublic["role"]] {
  return REMOVE_PERMISSION_BY_ROLE[role];
}

export function roleLabelKey(
  role: ClassMemberPublic["role"],
): "roleOwner" | "roleTeacher" | "roleAssistantTeacher" | "roleStudent" | "roleGuardian" {
  switch (role) {
    case "owner":
      return "roleOwner";
    case "teacher":
      return "roleTeacher";
    case "assistant_teacher":
      return "roleAssistantTeacher";
    case "student":
      return "roleStudent";
    case "guardian":
      return "roleGuardian";
  }
}
