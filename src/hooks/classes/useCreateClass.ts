import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useTranslation } from "react-i18next";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { toast } from "@/components/ui/toast-manager";
import type { ClassPublic } from "@/lib/classes/classes";
import { messageFromError } from "@/lib/errors/convexError";

type CreateClassArgs = {
  name: string;
  year: number;
  description?: string;
  icon?: string;
};

function listQueryKey() {
  return convexQuery(api.classes.listMine, {}).queryKey;
}

export function useCreateClass() {
  const { t } = useTranslation("common");
  const queryClient = useQueryClient();
  const mutationFn = useConvexMutation(api.classes.create);
  const queryKey = listQueryKey();

  return useMutation({
    mutationFn: (args: CreateClassArgs) => mutationFn(args),
    onMutate: async (args) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ClassPublic[]>(queryKey);
      const optimisticId = `optimistic:${crypto.randomUUID()}` as Id<"classes">;
      const now = Date.now();
      const optimistic: ClassPublic = {
        _id: optimisticId,
        _creationTime: now,
        ownerId: "optimistic" as Id<"users">,
        name: args.name,
        year: args.year,
        description: args.description,
        icon: args.icon,
        updatedAt: now,
        role: "owner",
        _pending: true,
      };
      queryClient.setQueryData<ClassPublic[]>(queryKey, (old) =>
        old ? [optimistic, ...old] : [optimistic],
      );
      return { previous, queryKey, optimisticId };
    },
    onError: (error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
      toast.add({
        title: messageFromError(error, "Could not create class", t("rateLimited")),
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
