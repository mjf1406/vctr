import {
  useMutation,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query";

type OptimisticContext = {
  queryKeys: readonly QueryKey[];
  previousByKey: readonly unknown[];
};

type UseOptimisticMutationOptions<TVariables, TResult> = {
  mutationFn: (variables: TVariables) => Promise<TResult>;
  queryKeys: readonly QueryKey[];
  applyOptimisticUpdate: (
    queryClient: ReturnType<typeof useQueryClient>,
    variables: TVariables,
    previousByKey: readonly unknown[],
  ) => void;
  onSettledInvalidate?: boolean;
} & Omit<
  UseMutationOptions<TResult, Error, TVariables, OptimisticContext>,
  "mutationFn" | "onMutate" | "onError" | "onSettled"
>;

/**
 * Generic optimistic mutation helper for TanStack Query + Convex.
 *
 * - onMutate: cancel + snapshot + apply optimistic update
 * - onError: restore snapshot
 * - onSettled: invalidate affected query keys
 */
export function useOptimisticMutation<TVariables, TResult>(
  options: UseOptimisticMutationOptions<TVariables, TResult>,
) {
  const queryClient = useQueryClient();

  return useMutation<TResult, Error, TVariables, OptimisticContext>({
    ...options,
    retry: false,
    mutationFn: options.mutationFn,

    onMutate: async (variables) => {
      const queryKeys = options.queryKeys;

      // Cancel + snapshot before applying optimistic changes.
      const previousByKey = await Promise.all(
        queryKeys.map(async (queryKey) => {
          await queryClient.cancelQueries({ queryKey });
          return queryClient.getQueryData(queryKey);
        }),
      );

      options.applyOptimisticUpdate(queryClient, variables, previousByKey);

      return {
        queryKeys,
        previousByKey,
      };
    },

    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }
      context.queryKeys.forEach((queryKey, index) => {
        const previous = context.previousByKey[index];
        queryClient.setQueryData(queryKey, previous);
      });
    },

    onSettled: () => {
      if (options.onSettledInvalidate === false) {
        return;
      }
      options.queryKeys.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey });
      });
    },
  });
}
