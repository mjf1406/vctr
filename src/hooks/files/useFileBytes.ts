import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useConvex } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { FIVE_MINUTES } from "@/lib/queryCache";

export function fileBytesQueryKey(fileId: Id<"files">) {
  return ["files", "getFileBytes", fileId] as const;
}

type FileBytesResult = {
  objectUrl: string;
  contentType: string;
  name: string;
};

/**
 * Object URL for a file the current user may access (owner or class `files:read`).
 * Fetches bytes via an action (access re-checked server-side) and builds a blob: URL.
 * gcTime: 5 minutes — access rarely changes; revoke the object URL on unmount.
 */
export function useFileBytes(fileId: Id<"files"> | undefined) {
  const convex = useConvex();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const enabled = isAuthenticated && fileId !== undefined;

  const { data, isPending, isError, error, isSuccess, refetch, status } = useQuery({
    queryKey: fileId !== undefined ? fileBytesQueryKey(fileId) : ["files", "getFileBytes", "skip"],
    queryFn: async (): Promise<FileBytesResult | null> => {
      if (fileId === undefined) {
        return null;
      }
      const result = await convex.action(api.files.getFileBytes, { fileId });
      if (!result) {
        return null;
      }
      const blob = new Blob([result.bytes], { type: result.contentType });
      return {
        objectUrl: URL.createObjectURL(blob),
        contentType: result.contentType,
        name: result.name,
      };
    },
    enabled,
    gcTime: FIVE_MINUTES,
    staleTime: FIVE_MINUTES,
    retry: false,
  });

  const objectUrl = data?.objectUrl;
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  return {
    data,
    url: data?.objectUrl ?? null,
    isPending: isAuthLoading || isPending,
    isAuthLoading,
    isError,
    error,
    isSuccess,
    refetch,
    status,
  };
}

/** @deprecated Prefer `useFileBytes` — kept as an alias during migration. */
export const useFileUrl = useFileBytes;
