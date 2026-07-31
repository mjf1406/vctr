import { APP_CONFIG } from "../appConfig.js";
import type { Id } from "../_generated/dataModel.js";
import type { MutationCtx } from "../_generated/server.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Normalize an email for trial-grant identity.
 * Applies Unicode NFKC, lowercases, trims, strips `+tag`, and strips dots for
 * Gmail/Googlemail. Non-ASCII remaining after NFKC is stripped.
 */
export function normalizeEmail(email: string): string {
  const trimmed = email.normalize("NFKC").trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0) {
    return trimmed;
  }
  let local = stripNonAscii(trimmed.slice(0, at));
  const domain = stripNonAscii(trimmed.slice(at + 1));

  const plus = local.indexOf("+");
  if (plus >= 0) {
    local = local.slice(0, plus);
  }

  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.replaceAll(".", "");
    return `${local}@gmail.com`;
  }

  return `${local}@${domain}`;
}

function stripNonAscii(value: string): string {
  let result = "";
  for (const char of value) {
    if (char.charCodeAt(0) <= 0x7f) {
      result += char;
    }
  }
  return result;
}

/**
 * Claim (or re-attach) the one-time trial grant for this email.
 * Existing grants keep their original `endsAt` — never reset.
 */
export async function claimTrialGrant(
  ctx: MutationCtx,
  userId: Id<"users">,
  email: string,
): Promise<void> {
  const emailKey = normalizeEmail(email);
  if (!emailKey.includes("@")) {
    return;
  }

  const existing = await ctx.db
    .query("trialGrants")
    .withIndex("by_emailKey", (q) => q.eq("emailKey", emailKey))
    .unique();

  if (existing) {
    if (existing.userId !== userId) {
      await ctx.db.patch("trialGrants", existing._id, { userId });
    }
    return;
  }

  const now = Date.now();
  await ctx.db.insert("trialGrants", {
    emailKey,
    userId,
    startedAt: now,
    endsAt: now + APP_CONFIG.trial.days * MS_PER_DAY,
  });
}
