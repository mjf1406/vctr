import { cronJobs } from "convex/server";

import { internal } from "./_generated/api.js";

const crons = cronJobs();

crons.daily(
  "purge orphaned storage blobs",
  { hourUTC: 4, minuteUTC: 15 },
  internal.filesInternal.purgeOrphanedStorage,
);

crons.daily(
  "reconcile polar subscriptions",
  { hourUTC: 5, minuteUTC: 0 },
  internal.polarReconcile.reconcileSubscriptions,
);

export default crons;
