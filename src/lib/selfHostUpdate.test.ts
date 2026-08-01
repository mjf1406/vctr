import { describe, expect, test } from "vite-plus/test";

import { isNewerSemver, normalizeSemver, selfHostUpgradeDocsUrl } from "./selfHostUpdate";

describe("normalizeSemver", () => {
  test("strips leading v and rejects placeholders", () => {
    expect(normalizeSemver("v1.2.3")).toBe("1.2.3");
    expect(normalizeSemver("1.2.3")).toBe("1.2.3");
    expect(normalizeSemver("0.0.0")).toBeNull();
    expect(normalizeSemver("docker")).toBeNull();
    expect(normalizeSemver("")).toBeNull();
    expect(normalizeSemver(null)).toBeNull();
  });
});

describe("isNewerSemver", () => {
  test("compares major.minor.patch", () => {
    expect(isNewerSemver("1.0.1", "1.0.0")).toBe(true);
    expect(isNewerSemver("1.1.0", "1.0.9")).toBe(true);
    expect(isNewerSemver("2.0.0", "1.9.9")).toBe(true);
    expect(isNewerSemver("1.0.0", "1.0.0")).toBe(false);
    expect(isNewerSemver("1.0.0", "1.0.1")).toBe(false);
    expect(isNewerSemver("not-a-version", "1.0.0")).toBe(false);
  });
});

describe("selfHostUpgradeDocsUrl", () => {
  test("adds upgrading hash", () => {
    expect(selfHostUpgradeDocsUrl()).toContain("#upgrading");
  });
});
