import { describe, expect, test } from "vite-plus/test";

import { resolveAppOrigin, resolveAppUrl } from "../../../convex/lib/billingGuards";

describe("billingGuards URL helpers", () => {
  test("resolveAppUrl joins origin and path", () => {
    const origin = resolveAppOrigin();
    expect(resolveAppUrl("/billing")).toBe(`${origin.replace(/\/$/, "")}/billing`);
    expect(resolveAppUrl("billing")).toBe(`${origin.replace(/\/$/, "")}/billing`);
  });
});
