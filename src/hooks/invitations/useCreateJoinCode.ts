import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useTranslation } from "react-i18next";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { toast } from "@/components/ui/toast-manager";
import { createOptimisticJoinCodeId, type JoinCodePublic } from "@/lib/invitations/joinCodes";
import type { JoinCodeRole } from "@/lib/permissions/classPermissions";
import { messageFromError } from "@/lib/errors/convexError";

type CreateJoinCodeArgs = {
  classId: Id<"classes">;
  role: JoinCodeRole;
  ttlMs: number;
  maxUses: number;
};

function listQueryKey(classId: Id<"classes">, now: number) {
  return convexQuery(api.joinCodes.listForClass, { classId, now }).queryKey;
}

/**
 * Optimistic create for join codes.
 * `listNow` should match the `now` used by the active list query so the cache key aligns.
 */
export function useCreateJoinCode(listNow: number) {
  const { t } = useTranslation("classes");
  const { t: tCommon } = useTranslation("common");
  const queryClient = useQueryClient();
  const mutationFn = useConvexMutation(api.joinCodes.create);

  return useMutation({
    mutationFn: (args: CreateJoinCodeArgs) => mutationFn(args),
    onMutate: async (args) => {
      const queryKey = listQueryKey(args.classId, listNow);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<JoinCodePublic[]>(queryKey);
      const now = Date.now();
      const optimistic: JoinCodePublic = {
        _id: createOptimisticJoinCodeId(),
        _creationTime: now,
        code: "······",
        classId: args.classId,
        createdBy: "optimistic" as Id<"users">,
        role: args.role,
        expiresAt: now + args.ttlMs,
        maxUses: args.maxUses,
        useCount: 0,
        _pending: true,
      };
      queryClient.setQueryData<JoinCodePublic[]>(queryKey, (old) =>
        old ? [optimistic, ...old] : [optimistic],
      );
      return { previous, queryKey };
    },
    onError: (error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
      toast.add({
        title: messageFromError(error, t("createInviteFailed"), tCommon("rateLimited")),
        type: "error",
      });
    },
    onSettled: (_data, _error, _variables, context) => {
      if (context?.queryKey) {
        void queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}
