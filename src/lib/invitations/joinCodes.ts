import type { Doc, Id } from "../../../convex/_generated/dataModel";

export type JoinCodePublic = Omit<Doc<"joinCodes">, "expirationJobId"> & {
  _pending?: boolean;
};

export function isPendingJoinCode(code: JoinCodePublic): boolean {
  return code._pending === true || String(code._id).startsWith("optimistic:");
}

export function remainingUses(code: Pick<JoinCodePublic, "maxUses" | "useCount">): number {
  return Math.max(0, code.maxUses - code.useCount);
}

/** Display form: `ABCDEF` → `ABC-DEF`. Passes through incomplete/pending strings unchanged. */
export function formatJoinCodeDisplay(code: string): string {
  if (code.length !== 6) {
    return code;
  }
  return `${code.slice(0, 3)}–${code.slice(3)}`;
}

export function createOptimisticJoinCodeId(): Id<"joinCodes"> {
  return `optimistic:${crypto.randomUUID()}` as Id<"joinCodes">;
}

/**
 * Query param for join-code share links (`/join?jc=…`).
 * Must not be `code` — that collides with Convex Auth's OAuth/magic-link handler.
 */
export const JOIN_CODE_PARAM = "jc";

/** Absolute share URL: `{origin}{BASE_URL}join?jc=…` */
export function joinCodeShareUrl(code: string): string {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return new URL(
    `join?${JOIN_CODE_PARAM}=${encodeURIComponent(code)}`,
    `${window.location.origin}${base}`,
  ).href;
}
