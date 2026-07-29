import type { FunctionReturnType } from "convex/server";

import { api } from "../../../convex/_generated/api";

/** Class document from get / mutations (no membership role). */
export type ClassDoc = NonNullable<FunctionReturnType<typeof api.classes.get>>;

/** Home-list class with the viewer's membership role for O(1) UI gating. */
export type ClassPublic = FunctionReturnType<typeof api.classes.listMine>[number] & {
  /** Present when optimistic create is in flight. */
  _pending?: boolean;
};

export function isClassArchived(classDoc: Pick<ClassDoc, "archivedAt">): boolean {
  return classDoc.archivedAt !== undefined;
}

export function isPendingClass(classDoc: Pick<ClassPublic, "_pending" | "_id">): boolean {
  return classDoc._pending === true || String(classDoc._id).startsWith("optimistic");
}

export function sortClasses(classes: Array<ClassPublic>, language: string): Array<ClassPublic> {
  const collator = new Intl.Collator(language, { sensitivity: "base" });
  return [...classes].sort((a, b) => collator.compare(a.name, b.name));
}

export function slugifyClassName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function getClassUpdatedAt(
  classDoc: Pick<ClassDoc, "updatedAt" | "_creationTime">,
): number | undefined {
  if (typeof classDoc.updatedAt === "number") {
    return classDoc.updatedAt;
  }
  return classDoc._creationTime;
}

export const CLASS_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Includes `"schools"` for stored settings / restore; UI currently shows classes only. */
export type HomeSectionId = "schools" | "classes";

// ORGS_DISABLED: was ["schools", "classes"] — restore schools when org UI returns.
export const DEFAULT_HOME_SECTION_ORDER: Array<HomeSectionId> = ["classes"];

export function normalizeHomeSectionOrder(
  order: Array<HomeSectionId> | undefined,
): Array<HomeSectionId> {
  const unique: Array<HomeSectionId> = [];
  for (const id of order ?? []) {
    // ORGS_DISABLED: skip "schools" while org UI is quarantined.
    if (id === "classes" && !unique.includes(id)) {
      unique.push(id);
    }
  }
  for (const id of DEFAULT_HOME_SECTION_ORDER) {
    if (!unique.includes(id)) {
      unique.push(id);
    }
  }
  return unique;
}
