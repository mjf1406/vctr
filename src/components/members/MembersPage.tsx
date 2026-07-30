import { UsersIcon } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { MemberRow } from "@/components/members/MemberRow";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useClassMembersByRole } from "@/hooks/members/useClassMembersByRole";
import { useRemoveClassMember } from "@/hooks/members/useRemoveClassMember";
import { useCurrentUser } from "@/hooks/user/useCurrentUser";
import type { ClassMemberPublic, MemberListRole } from "@/lib/members/members";
import type { Id } from "../../../convex/_generated/dataModel";

type MembersPageProps = {
  classId: Id<"classes">;
  role: MemberListRole;
  titleKey: "navTeachers" | "navAssistantTeachers" | "navStudents" | "navGuardians";
};

function MembersSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-16 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export function MembersPage({ classId, role, titleKey }: MembersPageProps) {
  const { t } = useTranslation("classes");
  const { data: currentUser } = useCurrentUser();
  const { data, isPending, isError, refetch, isAuthLoading } = useClassMembersByRole(classId, role);
  const removeMutation = useRemoveClassMember(role);
  const members = data ?? [];

  const handleRemove = useCallback(
    (member: ClassMemberPublic) => {
      void removeMutation.mutateAsync({
        classId,
        userId: member.userId,
      });
    },
    [classId, removeMutation],
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t(titleKey)}</h1>
        <p className="text-sm text-muted-foreground">{t("membersDescription")}</p>
      </div>

      {isPending || isAuthLoading ? <MembersSkeleton /> : null}

      {!isPending && !isAuthLoading && isError ? (
        <ErrorState
          title={t("membersLoadFailed")}
          onRetry={() => {
            void refetch();
          }}
        />
      ) : null}

      {!isPending && !isAuthLoading && !isError && members.length === 0 ? (
        <Empty card>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersIcon />
            </EmptyMedia>
            <EmptyTitle>{t("membersEmptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("membersEmptyDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {!isPending && !isAuthLoading && !isError && members.length > 0 ? (
        <div className="flex flex-col gap-3">
          {members.map((member) => (
            <MemberRow
              key={member.userId}
              member={member}
              isSelf={currentUser?._id === member.userId}
              onRemove={handleRemove}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
