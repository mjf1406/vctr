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
