import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useTranslation } from "react-i18next";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { toast } from "@/components/ui/toast-manager";
import type { JoinCodePublic } from "@/lib/invitations/joinCodes";
import { messageFromError } from "@/lib/errors/convexError";

type RevokeJoinCodeArgs = {
  classId: Id<"classes">;
  joinCodeId: Id<"joinCodes">;
};

function listQueryKey(classId: Id<"classes">, now: number) {
  return convexQuery(api.joinCodes.listForClass, { classId, now }).queryKey;
}

export function useRevokeJoinCode(listNow: number) {
  const { t } = useTranslation("classes");
  const { t: tCommon } = useTranslation("common");
  const queryClient = useQueryClient();
  const mutationFn = useConvexMutation(api.joinCodes.revoke);

  return useMutation({
    mutationFn: (args: RevokeJoinCodeArgs) => mutationFn(args),
    onMutate: async (args) => {
      const queryKey = listQueryKey(args.classId, listNow);
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<JoinCodePublic[]>(queryKey);
      queryClient.setQueryData<JoinCodePublic[]>(queryKey, (old) => {
        if (!old) return old;
        return old.filter((code) => code._id !== args.joinCodeId);
      });
      return { previous, queryKey };
    },
    onError: (error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
      toast.add({
        title: messageFromError(error, t("revokeInviteFailed"), tCommon("rateLimited")),
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
