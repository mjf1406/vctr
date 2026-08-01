import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";

import { components } from "../_generated/api.js";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  classCreate: { kind: "token bucket", rate: 10, period: HOUR, capacity: 3 },
  classCreateGlobal: { kind: "token bucket", rate: 60, period: MINUTE, capacity: 20 },
  classUpdate: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 5 },
  classArchive: { kind: "token bucket", rate: 20, period: MINUTE, capacity: 5 },
  classDelete: { kind: "token bucket", rate: 10, period: HOUR, capacity: 2 },
  classTransferOwnership: { kind: "token bucket", rate: 10, period: HOUR, capacity: 2 },
  accountDelete: { kind: "token bucket", rate: 5, period: HOUR, capacity: 1 },
  signOutOtherSessions: { kind: "token bucket", rate: 10, period: HOUR, capacity: 3 },
  joinCodeCreate: { kind: "token bucket", rate: 30, period: HOUR, capacity: 5 },
  joinCodeRevoke: { kind: "token bucket", rate: 60, period: HOUR, capacity: 10 },
  joinCodeRedeemShort: { kind: "token bucket", rate: 5, period: 5 * MINUTE, capacity: 5 },
  joinCodeRedeemHourly: { kind: "token bucket", rate: 30, period: HOUR, capacity: 30 },
  /** Shared across all users — bounds distributed join-code guessing. */
  joinCodeRedeemGlobal: { kind: "token bucket", rate: 200, period: MINUTE, capacity: 50 },
  /** Failure-only counter — successful redeems do not consume this bucket. */
  joinCodeRedeemFailure: { kind: "token bucket", rate: 10, period: HOUR, capacity: 5 },
  memberSuspend: { kind: "token bucket", rate: 60, period: HOUR, capacity: 10 },
  memberRemove: { kind: "token bucket", rate: 60, period: HOUR, capacity: 10 },
  memberSetRole: { kind: "token bucket", rate: 60, period: HOUR, capacity: 10 },
  memberSetGuardianLinks: { kind: "token bucket", rate: 60, period: HOUR, capacity: 10 },
  fileUploadUrl: { kind: "token bucket", rate: 30, period: HOUR, capacity: 10 },
  fileUploadUrlGlobal: { kind: "token bucket", rate: 120, period: MINUTE, capacity: 40 },
  fileWatchPending: { kind: "token bucket", rate: 30, period: HOUR, capacity: 10 },
  fileFinalize: { kind: "token bucket", rate: 30, period: HOUR, capacity: 10 },
  fileFinalizeGlobal: { kind: "token bucket", rate: 120, period: MINUTE, capacity: 40 },
  /** Per-user bound for hard reloads; client caches blobs forever under fileId. */
  fileGetBytes: { kind: "token bucket", rate: 200, period: HOUR, capacity: 60 },
  fileGetBytesGlobal: { kind: "token bucket", rate: 600, period: MINUTE, capacity: 120 },
  fileDelete: { kind: "token bucket", rate: 60, period: HOUR, capacity: 20 },
  fileRename: { kind: "token bucket", rate: 60, period: HOUR, capacity: 20 },
  ensureTrialGrant: { kind: "token bucket", rate: 20, period: HOUR, capacity: 5 },
  updateLanguage: { kind: "token bucket", rate: 30, period: HOUR, capacity: 10 },
  updateDisplayName: { kind: "token bucket", rate: 30, period: HOUR, capacity: 10 },
  updateAvatar: { kind: "token bucket", rate: 20, period: HOUR, capacity: 5 },
  clearAvatar: { kind: "token bucket", rate: 20, period: HOUR, capacity: 5 },
  billingCheckout: { kind: "token bucket", rate: 10, period: HOUR, capacity: 3 },
  billingCheckoutGlobal: { kind: "token bucket", rate: 60, period: MINUTE, capacity: 20 },
  billingPortal: { kind: "token bucket", rate: 20, period: HOUR, capacity: 5 },
  billingPortalGlobal: { kind: "token bucket", rate: 60, period: MINUTE, capacity: 20 },
  billingChange: { kind: "token bucket", rate: 10, period: HOUR, capacity: 3 },
  billingChangeGlobal: { kind: "token bucket", rate: 60, period: MINUTE, capacity: 20 },
  billingCancel: { kind: "token bucket", rate: 10, period: HOUR, capacity: 3 },
  billingCancelGlobal: { kind: "token bucket", rate: 60, period: MINUTE, capacity: 20 },
  billingOrders: { kind: "token bucket", rate: 60, period: HOUR, capacity: 20 },
  billingOrdersGlobal: { kind: "token bucket", rate: 120, period: MINUTE, capacity: 40 },
});

export type RateLimitName = Parameters<typeof rateLimiter.limit>[1];
