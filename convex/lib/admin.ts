import { ConvexError } from "convex/values";

import { api } from "../_generated/api.js";
import type { ActionCtx } from "../_generated/server.js";
import { normalizeEmail } from "./trial.js";

function adminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((entry) => normalizeEmail(entry.trim()))
      .filter((entry) => entry.includes("@")),
  );
}

/**
 * Require the signed-in user to be listed in the `ADMIN_EMAILS` Convex env var
 * (comma-separated, compared after trial email normalization).
 */
export async function requireAdmin(ctx: ActionCtx): Promise<{ userId: string; email: string }> {
  const user = await ctx.runQuery(api.users.currentUser, {});
  if (!user?.email) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "Not authenticated",
    });
  }
  const normalized = normalizeEmail(user.email);
  if (!adminEmails().has(normalized)) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return { userId: user._id, email: user.email };
}
