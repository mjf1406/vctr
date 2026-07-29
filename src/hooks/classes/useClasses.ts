import { useAuthedQuery } from "@/hooks/useAuthedQuery";
import { api } from "../../../convex/_generated/api";
import { ONE_HOUR } from "@/lib/queryCache";

export function useClasses() {
  return useAuthedQuery(api.classes.listMine, {}, { gcTime: ONE_HOUR });
}
