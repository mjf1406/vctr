import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useAuthActions } from "@convex-dev/auth/react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import { toast } from "@/components/ui/toast-manager";
import { codeFromError, messageFromError } from "@/lib/errors/convexError";

type CurrentUser = Doc<"users"> & {
  settings: Doc<"userSettings"> | null;
  providers: Array<string>;
};

const ACCOUNT_ERROR_KEYS = {
  OWNS_CLASSES: "errorOwnsClasses",
  ACTIVE_SUBSCRIPTION: "errorActiveSubscription",
  CONFIRMATION_MISMATCH: "errorConfirmationMismatch",
} as const;

function currentUserQueryKey() {
  return convexQuery(api.users.currentUser, {}).queryKey;
}

function deletionBlockersQueryKey() {
  return convexQuery(api.account.getDeletionBlockers, {}).queryKey;
}

export function useDeleteAccount() {
  const { t } = useTranslation("account");
  const { t: tCommon } = useTranslation("common");
  const queryClient = useQueryClient();
  const mutationFn = useConvexMutation(api.account.deleteAccount);
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const userKey = currentUserQueryKey();
  const blockersKey = deletionBlockersQueryKey();

  return useMutation({
    mutationFn: (args: { confirmation: string }) => mutationFn(args),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: userKey });
      await queryClient.cancelQueries({ queryKey: blockersKey });
      const previousUser = queryClient.getQueryData<CurrentUser | null>(userKey);
      const previousBlockers = queryClient.getQueryData<Array<string>>(blockersKey);
      queryClient.setQueryData<CurrentUser | null>(userKey, null);
      return { previousUser, previousBlockers };
    },
    onError: (error, _variables, context) => {
      if (context?.previousUser !== undefined) {
        queryClient.setQueryData(userKey, context.previousUser);
      }
      if (context?.previousBlockers !== undefined) {
        queryClient.setQueryData(blockersKey, context.previousBlockers);
      }

      const code = codeFromError(error);
      const title =
        code && code in ACCOUNT_ERROR_KEYS
          ? t(ACCOUNT_ERROR_KEYS[code as keyof typeof ACCOUNT_ERROR_KEYS])
          : messageFromError(error, t("deleteFailed"), tCommon("rateLimited"));

      toast.add({
        title,
        type: "error",
      });
    },
    onSuccess: async () => {
      await signOut();
      await navigate({ to: "/login" });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: userKey });
      void queryClient.invalidateQueries({ queryKey: blockersKey });
    },
  });
}
