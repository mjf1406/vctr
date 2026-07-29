import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useAuthedQuery } from "@/hooks/useAuthedQuery";
import { ONE_HOUR } from "@/lib/queryCache";

export function useClassPermissions(classId: Id<"classes">) {
  return useAuthedQuery(api.permissions.forClass, { classId }, { gcTime: ONE_HOUR });
}
