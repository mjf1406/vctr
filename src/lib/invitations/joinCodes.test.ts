import { describe, expect, test } from "vite-plus/test";

import { formatJoinCodeDisplay, joinCodeShareUrl, JOIN_CODE_PARAM } from "./joinCodes";

describe("joinCodes", () => {
  test("formats complete codes as XXX-XXX", () => {
    expect(formatJoinCodeDisplay("ABCDEF")).toBe("ABC–DEF");
    expect(formatJoinCodeDisplay("AB12CD")).toBe("AB1–2CD");
  });

  test("leaves incomplete codes unchanged", () => {
    expect(formatJoinCodeDisplay("ABCDE")).toBe("ABCDE");
    expect(formatJoinCodeDisplay("")).toBe("");
  });

  test("share URL uses JOIN_CODE_PARAM and not code", () => {
    expect(JOIN_CODE_PARAM).toBe("jc");
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { location: { origin: "http://localhost:5173" } },
    });
    try {
      const url = joinCodeShareUrl("A42YRQ");
      expect(url).toContain(`join?${JOIN_CODE_PARAM}=A42YRQ`);
      expect(url).not.toContain("code=");
    } finally {
      if (originalWindow === undefined) {
        Reflect.deleteProperty(globalThis, "window");
      } else {
        Object.defineProperty(globalThis, "window", {
          configurable: true,
          value: originalWindow,
        });
      }
    }
  });
});
