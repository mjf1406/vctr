import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useTranslation } from "react-i18next";

import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { toast } from "@/components/ui/toast-manager";
import { mutationErrorMessage } from "@/lib/classes/mutationErrorMessage";

type ClassDoc = Doc<"classes">;

type UpdateClassArgs = {
  classId: Id<"classes">;
  name: string;
  year: number;
  description?: string;
  icon?: string;
};

function listQueryKey() {
  return convexQuery(api.classes.listMine, {}).queryKey;
}

function getQueryKey(classId: Id<"classes">) {
  return convexQuery(api.classes.get, { classId }).queryKey;
}

export function useUpdateClass() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();
  const mutationFn = useConvexMutation(api.classes.update);
  const listKey = listQueryKey();

  return useMutation({
    mutationFn: (args: UpdateClassArgs) => mutationFn(args),
    onMutate: async (args) => {
      const detailKey = getQueryKey(args.classId);
      await queryClient.cancelQueries({ queryKey: listKey });
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previousList = queryClient.getQueryData<ClassDoc[]>(listKey);
      const previousDetail = queryClient.getQueryData<ClassDoc | null>(detailKey);
      const now = Date.now();
      const patch = {
        name: args.name,
        year: args.year,
        description: args.description,
        icon: args.icon,
        updatedAt: now,
      };
      queryClient.setQueryData<ClassDoc[]>(listKey, (old) => {
        if (!old) return old;
        return old.map((classDoc) =>
          classDoc._id === args.classId ? { ...classDoc, ...patch } : classDoc,
        );
      });
      queryClient.setQueryData<ClassDoc | null>(detailKey, (old) =>
        old ? { ...old, ...patch } : old,
      );
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
        title: mutationErrorMessage(error, "Could not update class", t("rateLimited")),
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
