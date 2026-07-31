import { useConvexMutation } from "@convex-dev/react-query";
import { useTranslation } from "react-i18next";

import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { toast } from "@/components/ui/toast-manager";
import { classDetailQueryKey } from "@/hooks/classes/useClass";
import { classesListQueryKey } from "@/hooks/classes/useClasses";
import { eligibleOwnersQueryKey } from "@/hooks/classes/useEligibleOwners";
import { useOptimisticMutation } from "@/hooks/useOptimisticMutation";
import type { ClassPublic } from "@/lib/classes/classes";
import { messageFromError } from "@/lib/errors/convexError";

type ClassDoc = Doc<"classes">;

type TransferOwnershipArgs = {
  classId: Id<"classes">;
  toUserId: Id<"users">;
};

export function useTransferOwnership() {
  const { t } = useTranslation("classes");
  const { t: tCommon } = useTranslation("common");
  const mutationFn = useConvexMutation(api.classes.transferOwnership);
  const listKey = classesListQueryKey();

  return useOptimisticMutation({
    mutationFn: (args: TransferOwnershipArgs) => mutationFn(args),
    queryKeys: (args) => [
      listKey,
      classDetailQueryKey(args.classId),
      eligibleOwnersQueryKey(args.classId),
    ],
    applyOptimisticUpdate: (queryClient, args) => {
      const detailKey = classDetailQueryKey(args.classId);
      queryClient.setQueryData<ClassPublic[]>(listKey, (old) => {
        if (!old) return old;
        return old.map((entry) =>
          entry._id === args.classId
            ? { ...entry, ownerId: args.toUserId, role: "teacher" as const }
            : entry,
        );
      });
      queryClient.setQueryData<ClassDoc | null>(detailKey, (old) =>
        old ? { ...old, ownerId: args.toUserId } : old,
      );
    },
    onError: (error) => {
      toast.add({
        title: messageFromError(error, t("transferFailed"), tCommon("rateLimited")),
        type: "error",
      });
    },
  });
}
