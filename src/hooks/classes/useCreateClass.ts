import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";

import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { toast } from "@/components/ui/toast-manager";

type ClassDoc = Doc<"classes">;

type CreateClassArgs = {
  name: string;
  year: number;
  description?: string;
  icon?: string;
};

function listQueryKey() {
  return convexQuery(api.classes.listMine, {}).queryKey;
}

function mutationErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  const mutationFn = useConvexMutation(api.classes.create);
  const queryKey = listQueryKey();

  return useMutation({
    mutationFn: (args: CreateClassArgs) => mutationFn(args),
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ClassDoc[]>(queryKey);
      const optimisticId = `optimistic:${crypto.randomUUID()}` as Id<"classes">;
      const now = Date.now();
      const optimistic: ClassDoc = {
        _id: optimisticId,
        _creationTime: now,
        ownerId: "optimistic" as Id<"users">,
        name: args.name,
        year: args.year,
        description: args.description,
        icon: args.icon,
        updatedAt: now,
      };
      queryClient.setQueryData<ClassDoc[]>(queryKey, (old) =>
        old ? [optimistic, ...old] : [optimistic],
      );
      return { previous, queryKey, optimisticId };
    },
    onError: (error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
      toast.add({
        title: mutationErrorMessage(error, "Could not create class"),
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
