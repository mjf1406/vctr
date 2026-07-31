import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";

import { components } from "../_generated/api.js";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  classCreate: { kind: "token bucket", rate: 10, period: HOUR, capacity: 3 },
  classUpdate: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 5 },
  classArchive: { kind: "token bucket", rate: 20, period: MINUTE, capacity: 5 },
  classDelete: { kind: "token bucket", rate: 10, period: HOUR, capacity: 2 },
  classTransferOwnership: { kind: "token bucket", rate: 10, period: HOUR, capacity: 2 },
  accountDelete: { kind: "token bucket", rate: 5, period: HOUR, capacity: 1 },
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
  fileUploadUrl: { kind: "token bucket", rate: 30, period: HOUR, capacity: 10 },
  ensureTrialGrant: { kind: "token bucket", rate: 20, period: HOUR, capacity: 5 },
  updateLanguage: { kind: "token bucket", rate: 30, period: HOUR, capacity: 10 },
  billingCheckout: { kind: "token bucket", rate: 10, period: HOUR, capacity: 3 },
  billingPortal: { kind: "token bucket", rate: 20, period: HOUR, capacity: 5 },
  billingChange: { kind: "token bucket", rate: 10, period: HOUR, capacity: 3 },
  billingCancel: { kind: "token bucket", rate: 10, period: HOUR, capacity: 3 },
  billingOrders: { kind: "token bucket", rate: 60, period: HOUR, capacity: 20 },
});

export type RateLimitName = Parameters<typeof rateLimiter.limit>[1];
