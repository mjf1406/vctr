import { HOUR, MINUTE, RateLimiter } from "@convex-dev/rate-limiter";

import { components } from "../_generated/api.js";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  classCreate: { kind: "token bucket", rate: 10, period: HOUR, capacity: 3 },
  classUpdate: { kind: "token bucket", rate: 30, period: MINUTE, capacity: 5 },
  classArchive: { kind: "token bucket", rate: 20, period: MINUTE, capacity: 5 },
  classDelete: { kind: "token bucket", rate: 10, period: HOUR, capacity: 2 },
});
