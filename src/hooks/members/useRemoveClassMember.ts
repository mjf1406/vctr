import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useTranslation } from "react-i18next";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { toast } from "@/components/ui/toast-manager";
import type { ClassMemberCounts, ClassMemberPublic, MemberListRole } from "@/lib/members/members";
import { messageFromError } from "@/lib/errors/convexError";

type RemoveClassMemberArgs = {
  classId: Id<"classes">;
  userId: Id<"users">;
};

function listQueryKey(classId: Id<"classes">, role: MemberListRole) {
  return convexQuery(api.members.listByRole, { classId, role }).queryKey;
}

function countsQueryKey(classId: Id<"classes">) {
  return convexQuery(api.members.countsByRole, { classId }).queryKey;
}

export function useRemoveClassMember(listRole: MemberListRole) {
  const { t } = useTranslation("classes");
  const { t: tCommon } = useTranslation("common");
  const queryClient = useQueryClient();
  const mutationFn = useConvexMutation(api.members.remove);

  return useMutation({
    mutationFn: (args: RemoveClassMemberArgs) => mutationFn(args),
    onMutate: async (args) => {
      const queryKey = listQueryKey(args.classId, listRole);
      const countsKey = countsQueryKey(args.classId);
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: countsKey });
      const previous = queryClient.getQueryData<ClassMemberPublic[]>(queryKey);
      const previousCounts = queryClient.getQueryData<ClassMemberCounts>(countsKey);
      queryClient.setQueryData<ClassMemberPublic[]>(queryKey, (old) => {
        if (!old) return old;
        return old.filter((member) => member.userId !== args.userId);
      });
      queryClient.setQueryData<ClassMemberCounts>(countsKey, (old) => {
        if (!old) return old;
        const current = old[listRole];
        if (current === null) return old;
        return { ...old, [listRole]: Math.max(0, current - 1) };
      });
      return { previous, previousCounts, queryKey, countsKey };
    },
    onError: (error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
      if (context?.previousCounts !== undefined) {
        queryClient.setQueryData(context.countsKey, context.previousCounts);
      }
      toast.add({
        title: messageFromError(error, t("removeMemberFailed"), tCommon("rateLimited")),
        type: "error",
      });
    },
    onSettled: (_data, _error, variables, context) => {
      if (context?.queryKey) {
        void queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
      if (context?.countsKey) {
        void queryClient.invalidateQueries({ queryKey: context.countsKey });
      }
      if (variables?.classId) {
        void queryClient.invalidateQueries({
          queryKey: convexQuery(api.classes.listMine, {}).queryKey,
        });
        void queryClient.invalidateQueries({
          queryKey: convexQuery(api.permissions.forClass, {
            classId: variables.classId,
          }).queryKey,
        });
      }
    },
  });
}
