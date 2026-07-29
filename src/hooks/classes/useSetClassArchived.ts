import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";

import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { toast } from "@/components/ui/toast-manager";

type ClassDoc = Doc<"classes">;

type SetArchivedArgs = {
  classId: Id<"classes">;
  archived: boolean;
};

function listQueryKey() {
  return convexQuery(api.classes.listMine, {}).queryKey;
}

function mutationErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useSetClassArchived() {
  const queryClient = useQueryClient();
  const mutationFn = useConvexMutation(api.classes.setArchived);
  const queryKey = listQueryKey();

  return useMutation({
    mutationFn: (args: SetArchivedArgs) => mutationFn(args),
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ClassDoc[]>(queryKey);
      const now = Date.now();
      queryClient.setQueryData<ClassDoc[]>(queryKey, (old) => {
        if (!old) return old;
        return old.map((classDoc) =>
          classDoc._id === args.classId
            ? {
                ...classDoc,
                archivedAt: args.archived ? now : undefined,
                updatedAt: now,
              }
            : classDoc,
        );
      });
      return { previous, queryKey };
    },
    onError: (error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
      toast.add({
        title: mutationErrorMessage(error, "Could not update archive state"),
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
