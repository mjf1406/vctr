/**
 * Client-side id for optimistic cache rows.
 * `crypto.randomUUID` is missing on non-secure origins (e.g. http://LAN-IP self-host);
 * `getRandomValues` still works there.
 */
export function randomClientId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function patchDoc<TDoc>(oldDoc: TDoc | null, patch: (doc: TDoc) => TDoc): TDoc | null {
  if (!oldDoc) {
    return oldDoc;
  }
  return patch(oldDoc);
}

export function upsertById<TDoc extends { _id: unknown }>(
  list: readonly TDoc[] | null | undefined,
  doc: TDoc,
): TDoc[] {
  const current = list ?? [];
  const idx = current.findIndex((item) => item._id === doc._id);
  if (idx === -1) {
    return [...current, doc];
  }
  return [...current.slice(0, idx), doc, ...current.slice(idx + 1)];
}

export function removeById<TDoc extends { _id: unknown }>(
  list: readonly TDoc[] | null | undefined,
  id: TDoc["_id"],
): TDoc[] {
  const current = list ?? [];
  return current.filter((item) => item._id !== id);
}
