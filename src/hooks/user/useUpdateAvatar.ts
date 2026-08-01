import { useConvexMutation } from "@convex-dev/react-query";
import { useTranslation } from "react-i18next";

import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { toast } from "@/components/ui/toast-manager";
import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";
import { currentUserQueryKey } from "@/hooks/user/useCurrentUser";
import { messageFromError } from "@/lib/errors/convexError";

type CurrentUser = Doc<"users"> & {
  settings: Doc<"userSettings"> | null;
  providers: Array<string>;
};

type UpdateAvatarArgs = {
  fileId: Id<"files">;
};

/**
 * Optimistic profile photo update (self-host / Electron).
 * Shares `currentUserQueryKey` with `useCurrentUser` (gcTime: 1 hour).
 */
export function useUpdateAvatar() {
  const { t } = useTranslation("account");
  const { t: tCommon } = useTranslation("common");
  const mutationFn = useConvexMutation(api.users.updateAvatar);
  const queryKey = currentUserQueryKey();

  return useOptimisticMutation({
    mutationFn: (args: UpdateAvatarArgs) => mutationFn(args),
    queryKeys: [queryKey],
    applyOptimisticUpdate: (queryClient, { fileId }) => {
      queryClient.setQueryData<CurrentUser | null>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, avatarFileId: fileId };
      });
    },
    onError: (error) => {
      toast.add({
        type: "error",
        title: messageFromError(error, t("avatarSaveFailed"), tCommon("rateLimited")),
      });
    },
  });
}
