import { describe, expect, test } from "vite-plus/test";

import { sanitizeAvatarUrl } from "../../../convex/lib/avatarUrl";

describe("sanitizeAvatarUrl", () => {
  test("allows https googleusercontent hosts", () => {
    expect(sanitizeAvatarUrl("https://lh3.googleusercontent.com/a/ABCDEF=s96-c")).toBe(
      "https://lh3.googleusercontent.com/a/ABCDEF=s96-c",
    );
    expect(sanitizeAvatarUrl("https://googleusercontent.com/foo")).toBe(
      "https://googleusercontent.com/foo",
    );
  });

  test("rejects non-https, other hosts, and garbage", () => {
    expect(sanitizeAvatarUrl("http://lh3.googleusercontent.com/a")).toBeNull();
    expect(sanitizeAvatarUrl("https://evil.example/track.png")).toBeNull();
    expect(sanitizeAvatarUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeAvatarUrl("")).toBeNull();
    expect(sanitizeAvatarUrl(null)).toBeNull();
    expect(sanitizeAvatarUrl(undefined)).toBeNull();
    expect(sanitizeAvatarUrl("not a url")).toBeNull();
  });
});
