import { describe, expect, test } from "vite-plus/test";

import { patchDoc, removeById, upsertById } from "./optimistic";

describe("patchDoc", () => {
  test("returns null when doc is null", () => {
    expect(patchDoc(null, (doc: { name: string }) => ({ ...doc, name: "x" }))).toBeNull();
  });

  test("applies patch to existing doc", () => {
    expect(patchDoc({ name: "a", year: 1 }, (doc) => ({ ...doc, name: "b" }))).toEqual({
      name: "b",
      year: 1,
    });
  });
});

describe("upsertById", () => {
  test("appends when id is missing", () => {
    expect(upsertById([{ _id: "a", name: "A" }], { _id: "b", name: "B" })).toEqual([
      { _id: "a", name: "A" },
      { _id: "b", name: "B" },
    ]);
  });

  test("replaces existing id in place", () => {
    expect(
      upsertById(
        [
          { _id: "a", name: "A" },
          { _id: "b", name: "B" },
        ],
        { _id: "a", name: "A2" },
      ),
    ).toEqual([
      { _id: "a", name: "A2" },
      { _id: "b", name: "B" },
    ]);
  });

  test("treats null/undefined list as empty", () => {
    expect(upsertById(null, { _id: "a", name: "A" })).toEqual([{ _id: "a", name: "A" }]);
    expect(upsertById(undefined, { _id: "a", name: "A" })).toEqual([{ _id: "a", name: "A" }]);
  });
});

describe("removeById", () => {
  test("filters matching id", () => {
    expect(
      removeById(
        [
          { _id: "a", name: "A" },
          { _id: "b", name: "B" },
        ],
        "a",
      ),
    ).toEqual([{ _id: "b", name: "B" }]);
  });

  test("returns empty array for null/undefined list", () => {
    expect(removeById(null, "a")).toEqual([]);
    expect(removeById(undefined, "a")).toEqual([]);
  });
});
