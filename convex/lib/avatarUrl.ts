/**
 * Sanitize remote avatar URLs from OAuth providers.
 * Only HTTPS Google user-content hosts are accepted; everything else becomes null.
 */
export function sanitizeAvatarUrl(url: string | null | undefined): string | null {
  if (url === null || url === undefined) {
    return null;
  }
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") {
    return null;
  }
  const host = parsed.hostname.toLowerCase();
  if (host === "googleusercontent.com" || host.endsWith(".googleusercontent.com")) {
    return parsed.toString();
  }
  return null;
}
