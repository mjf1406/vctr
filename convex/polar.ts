import { Polar } from "@convex-dev/polar";
import { v } from "convex/values";

import { api, components } from "./_generated/api.js";
import type { DataModel } from "./_generated/dataModel.js";
import { action } from "./_generated/server.js";
import { requireAdmin } from "./lib/admin.js";
import { POLAR_ENV, polarEnvPresence } from "./lib/polarEnv.js";

export const polar = new Polar<DataModel, { proMonthly: string; proYearly: string }>(
  components.polar,
  {
    getUserInfo: async (ctx) => {
      const user = await ctx.runQuery(api.users.currentUser, {});
      if (!user?.email) {
        throw new Error("Not authenticated");
      }
      return { userId: user._id, email: user.email };
    },
    products: {
      proMonthly: POLAR_ENV.monthlyProductId,
      proYearly: POLAR_ENV.yearlyProductId,
    },
    organizationToken: POLAR_ENV.organizationToken,
    webhookSecret: POLAR_ENV.webhookSecret,
    server: POLAR_ENV.server,
  },
);

/** Public pricing catalog for configured products only. */
export const { getConfiguredProducts } = polar.api();

/**
 * Sync products from the Polar dashboard into the local component table.
 * Restricted to emails listed in the `ADMIN_EMAILS` Convex env var.
 */
export const syncProducts = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    await polar.syncProducts(ctx);
    return null;
  },
});

/**
 * Presence-only Polar env health report for admins.
 * Never returns secret values — only booleans and the active server mode.
 */
export const billingHealth = action({
  args: {},
  returns: v.object({
    server: v.union(v.literal("sandbox"), v.literal("production")),
    organizationToken: v.boolean(),
    webhookSecret: v.boolean(),
    monthlyProductId: v.boolean(),
    yearlyProductId: v.boolean(),
    adminEmails: v.boolean(),
  }),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return polarEnvPresence();
  },
});
