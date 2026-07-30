import type { Id } from "../../../convex/_generated/dataModel";
import { useAuthedQuery } from "@/hooks/useAuthedQuery";
import { api } from "../../../convex/_generated/api";
import { ONE_HOUR } from "@/lib/queryCache";

export function useJoinCodes(classId: Id<"classes">, now: number) {
  return useAuthedQuery(api.joinCodes.listForClass, { classId, now }, { gcTime: ONE_HOUR });
}
