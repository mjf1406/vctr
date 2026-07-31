import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useConvexAuth } from "@convex-dev/auth/react";
import { useConvex } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
export function fileBytesQueryKey(fileId: Id<"files">) {
  return ["files", "getFileBytes", fileId] as const;
}

type FileBytesResult = {
  blob: Blob;
  contentType: string;
  name: string;
};

/**
 * Object URL for a file the current user may access (owner or class `files:read`).
 * Fetches bytes via an action (access re-checked server-side) and caches the Blob.
 * A mount-local blob: URL is created from the cached Blob and revoked on unmount —
 * never store revokeable URLs in the query cache.
 * Files are immutable (replace = new fileId), so staleTime/gcTime are Infinity —
 * fetch once per fileId until delete invalidation or tab cache drop.
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
        blob,
        contentType: result.contentType,
        name: result.name,
      };
    },
    enabled,
    gcTime: Infinity,
    staleTime: Infinity,
    retry: false,
  });

  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!data?.blob) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(data.blob);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [data?.blob]);

  return {
    data,
    url,
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
