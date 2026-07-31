import { convexQuery } from "@convex-dev/react-query";

import { useAuthedQuery } from "@/hooks/useAuthedQuery";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { FIVE_MINUTES } from "@/lib/queryCache";

export function fileUrlQueryKey(fileId: Id<"files">) {
  return convexQuery(api.files.getFileUrl, { fileId }).queryKey;
}

/**
 * Short-lived storage URL for a file the current user owns.
 * gcTime: 5 minutes — URLs expire and ownership rarely changes.
 */
export function useFileUrl(fileId: Id<"files"> | undefined) {
  return useAuthedQuery(api.files.getFileUrl, fileId !== undefined ? { fileId } : "skip", {
    gcTime: FIVE_MINUTES,
  });
}
