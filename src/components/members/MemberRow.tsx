import { UserMinusIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Can } from "@/components/permissions/Can";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  removePermissionForMember,
  roleLabelKey,
  type ClassMemberPublic,
} from "@/lib/members/members";
import { getDisplayName, getInitials } from "@/lib/user/userDisplay";
import { sanitizeAvatarUrl } from "../../../convex/lib/avatarUrl";

type MemberRowProps = {
  member: ClassMemberPublic;
  /** Hide remove for the current viewer (server also rejects self-remove). */
  isSelf: boolean;
  onRemove: (member: ClassMemberPublic) => void;
};

export function MemberRow({ member, isSelf, onRemove }: MemberRowProps) {
  const { t } = useTranslation("classes");
  const displayName = getDisplayName({
    _id: member.userId,
    name: member.name,
    email: member.email,
  });
  const initials = getInitials({
    _id: member.userId,
    name: member.name,
    email: member.email,
  });
  const removePermission = removePermissionForMember(member.role);
  const showRemove = !isSelf && removePermission !== null;
  const safeImage = sanitizeAvatarUrl(member.image);

  return (
    <div className="flex h-full flex-col gap-3 rounded-2xl border p-4">
      <div className="flex min-w-0 flex-col items-center gap-2 text-center">
        <Avatar className="size-12">
          {safeImage ? <AvatarImage src={safeImage} alt={displayName} /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col items-center gap-1">
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-2">
            <span className="truncate text-sm font-medium">{displayName}</span>
            {member.role === "owner" ? (
              <Badge variant="secondary">{t(roleLabelKey(member.role))}</Badge>
            ) : null}
          </div>
          {member.email?.trim() && member.name?.trim() ? (
            <span className="truncate text-xs text-muted-foreground">{member.email}</span>
          ) : null}
        </div>
      </div>
      {showRemove && removePermission ? (
        <Can permission={removePermission}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-auto w-full"
            onClick={() => onRemove(member)}
          >
            <UserMinusIcon data-icon="inline-start" />
            {t("removeMember")}
          </Button>
        </Can>
      ) : null}
    </div>
  );
}
