import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";

import { components } from "../_generated/api.js";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  classCreate: { kind: "token bucket", rate: 10, period: HOUR, capacity: 3 },
  classUpdate: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 5 },
  classArchive: { kind: "token bucket", rate: 20, period: MINUTE, capacity: 5 },
  classDelete: { kind: "token bucket", rate: 10, period: HOUR, capacity: 2 },
  accountDelete: { kind: "token bucket", rate: 5, period: HOUR, capacity: 1 },
  joinCodeCreate: { kind: "token bucket", rate: 30, period: HOUR, capacity: 5 },
  joinCodeRedeemShort: { kind: "token bucket", rate: 5, period: 5 * MINUTE, capacity: 5 },
  joinCodeRedeemHourly: { kind: "token bucket", rate: 30, period: HOUR, capacity: 30 },
});
