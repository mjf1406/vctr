import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useTranslation } from "react-i18next";

import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { toast } from "@/components/ui/toast-manager";
import type { ClassPublic } from "@/lib/classes/classes";
import { messageFromError } from "@/lib/errors/convexError";

type ClassDoc = Doc<"classes">;

type DeleteClassArgs = {
  classId: Id<"classes">;
  confirmation: string;
};

function listQueryKey() {
  return convexQuery(api.classes.listMine, {}).queryKey;
}

function getQueryKey(classId: Id<"classes">) {
  return convexQuery(api.classes.get, { classId }).queryKey;
}

export function useDeleteClass() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();
  const mutationFn = useConvexMutation(api.classes.remove);
  const listKey = listQueryKey();

  return useMutation({
    mutationFn: (args: DeleteClassArgs) => mutationFn(args),
    onMutate: async (args) => {
      const detailKey = getQueryKey(args.classId);
      await queryClient.cancelQueries({ queryKey: listKey });
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previousList = queryClient.getQueryData<ClassPublic[]>(listKey);
      const previousDetail = queryClient.getQueryData<ClassDoc | null>(detailKey);
      queryClient.setQueryData<ClassPublic[]>(listKey, (old) => {
        if (!old) return old;
        return old.filter((classDoc) => classDoc._id !== args.classId);
      });
      queryClient.setQueryData<ClassDoc | null>(detailKey, null);
      return { previousList, previousDetail, listKey, detailKey };
    },
    onError: (error, _variables, context) => {
      if (context?.previousList !== undefined) {
        queryClient.setQueryData(context.listKey, context.previousList);
      }
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(context.detailKey, context.previousDetail);
      }
      toast.add({
        title: messageFromError(error, "Could not delete class", t("rateLimited")),
        type: "error",
      });
    },
    onSettled: (_data, _error, _variables, context) => {
      if (context?.listKey) {
        void queryClient.invalidateQueries({ queryKey: context.listKey });
      }
      if (context?.detailKey) {
        void queryClient.invalidateQueries({ queryKey: context.detailKey });
      }
    },
  });
}
