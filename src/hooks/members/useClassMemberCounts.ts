import type { Id } from "../../../convex/_generated/dataModel";
import { useAuthedQuery } from "@/hooks/useAuthedQuery";
import { ONE_HOUR } from "@/lib/queryCache";
import { api } from "../../../convex/_generated/api";

export function useClassMemberCounts(classId: Id<"classes">) {
  return useAuthedQuery(api.members.countsByRole, { classId }, { gcTime: ONE_HOUR });
}
