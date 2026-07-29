import { useMutation, useQueryClient } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";

import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import type { AppLanguage } from "@/lib/languages";

type CurrentUser = Doc<"users"> & {
  settings: Doc<"userSettings"> | null;
};

export function useUpdateLanguage() {
  const queryClient = useQueryClient();
  const mutationFn = useConvexMutation(api.users.updateLanguage);
  const currentUserQuery = convexQuery(api.users.currentUser, {});

  return useMutation({
    mutationFn: (args: { language: AppLanguage }) => mutationFn(args),
    onMutate: async ({ language }) => {
      const queryKey = currentUserQuery.queryKey;
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<CurrentUser | null>(queryKey);

      queryClient.setQueryData<CurrentUser | null>(queryKey, (old) => {
        if (!old) {
          return old;
        }
        if (old.settings) {
          return {
            ...old,
            settings: {
              ...old.settings,
              language,
            },
          };
        }
        return {
          ...old,
          settings: {
            _id: "optimistic" as Id<"userSettings">,
            _creationTime: Date.now(),
            userId: old._id,
            language,
          },
        };
      });

      return { previous, queryKey };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(context.queryKey, context.previous);
      }
    },
    onSettled: (_data, _error, _variables, context) => {
      if (context?.queryKey) {
        void queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}
