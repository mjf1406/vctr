import { Polar } from "@convex-dev/polar";
import { v } from "convex/values";

import { api, components } from "./_generated/api.js";
import type { DataModel } from "./_generated/dataModel.js";
import { action } from "./_generated/server.js";
import { POLAR_ENV } from "./lib/polarEnv.js";

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

export const {
  changeCurrentSubscription,
  cancelCurrentSubscription,
  getConfiguredProducts,
  listAllProducts,
  listAllSubscriptions,
  generateCheckoutLink,
  generateCustomerPortalUrl,
} = polar.api();

/** One-time sync of products that already exist in the Polar dashboard. */
export const syncProducts = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await polar.syncProducts(ctx);
    return null;
  },
});
