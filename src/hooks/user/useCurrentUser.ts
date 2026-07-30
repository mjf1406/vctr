import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { useConvexAuth } from "@convex-dev/auth/react";

import { api } from "../../../convex/_generated/api";
import { ONE_HOUR } from "@/lib/queryCache";

export function currentUserQueryKey() {
  return convexQuery(api.users.currentUser, {}).queryKey;
}

export function useCurrentUser() {
  const { isAuthenticated } = useConvexAuth();

  return useQuery({
    ...convexQuery(api.users.currentUser, isAuthenticated ? {} : "skip"),
    gcTime: ONE_HOUR,
  });
}
