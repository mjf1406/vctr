import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";

import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { toast } from "@/components/ui/toast-manager";

type ClassDoc = Doc<"classes">;

type DeleteClassArgs = {
  classId: Id<"classes">;
  confirmation: string;
};

function listQueryKey() {
  return convexQuery(api.classes.listMine, {}).queryKey;
}

function mutationErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  const mutationFn = useConvexMutation(api.classes.remove);
  const queryKey = listQueryKey();

  return useMutation({
    mutationFn: (args: DeleteClassArgs) => mutationFn(args),
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ClassDoc[]>(queryKey);
      queryClient.setQueryData<ClassDoc[]>(queryKey, (old) => {
        if (!old) return old;
        return old.filter((classDoc) => classDoc._id !== args.classId);
      });
      return { previous, queryKey };
    },
    onError: (error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
      toast.add({
        title: mutationErrorMessage(error, "Could not delete class"),
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
