import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import {
  AssistantTeacherBadge,
  GuardianBadge,
  OwnerBadge,
  StudentBadge,
  TeacherBadge,
} from "@/components/icons/role-icons";

const ROLE_LABEL_KEYS = {
  owner: "roleOwner",
  teacher: "roleTeacher",
  assistant_teacher: "roleAssistantTeacher",
  student: "roleStudent",
  guardian: "roleGuardian",
} as const;

type KnownRole = keyof typeof ROLE_LABEL_KEYS;

type ClassRoleBadgeProps = {
  role: string;
  className?: string;
};

export function ClassRoleBadge({ role, className }: ClassRoleBadgeProps) {
  const { t } = useTranslation("classes");
  const labelKey = role in ROLE_LABEL_KEYS ? ROLE_LABEL_KEYS[role as KnownRole] : null;
  const label = labelKey ? t(labelKey) : role;

  switch (role) {
    case "owner":
      return <OwnerBadge className={className}>{label}</OwnerBadge>;
    case "teacher":
      return <TeacherBadge className={className}>{label}</TeacherBadge>;
    case "assistant_teacher":
      return <AssistantTeacherBadge className={className}>{label}</AssistantTeacherBadge>;
    case "student":
      return <StudentBadge className={className}>{label}</StudentBadge>;
    case "guardian":
      return <GuardianBadge className={className}>{label}</GuardianBadge>;
    default:
      return (
        <Badge variant="outline" className={className}>
          {label}
        </Badge>
      );
  }
}
