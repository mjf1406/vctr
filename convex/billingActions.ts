import { ordersList } from "@polar-sh/sdk/funcs/ordersList.js";
import { unwrapResultIterator } from "@polar-sh/sdk/types/operations.js";
import { ConvexError, v } from "convex/values";

import { api } from "./_generated/api.js";
import { action } from "./_generated/server.js";
import { isAlreadyCanceledError, throwBillingError } from "./lib/polarErrors.js";
import { polar } from "./polar.js";

const orderItemValidator = v.object({
  id: v.string(),
  description: v.string(),
  status: v.string(),
  createdAt: v.string(),
  totalAmount: v.number(),
  currency: v.string(),
  paid: v.boolean(),
});

const orderHistoryValidator = v.object({
  items: v.array(orderItemValidator),
  page: v.number(),
  maxPage: v.number(),
  totalCount: v.number(),
});

async function requireBillingUser(ctx: {
  runQuery: (
    ref: typeof api.users.currentUser,
    args: Record<string, never>,
  ) => Promise<{ _id: string; email?: string } | null>;
}) {
  const user = await ctx.runQuery(api.users.currentUser, {});
  if (!user?.email) {
    throw new ConvexError({
      code: "UNAUTHENTICATED",
      message: "Not authenticated",
    });
  }
  return { userId: user._id, email: user.email };
}

/**
 * Cancel the current subscription at period end.
 * Already-canceled Polar responses are treated as success (idempotent).
 */
export const cancelSubscription = action({
  args: {
    revokeImmediately: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { userId } = await requireBillingUser(ctx);

    try {
      const current = await polar.getCurrentSubscription(ctx, { userId });
      if (current?.cancelAtPeriodEnd && !args.revokeImmediately) {
        return null;
      }

      await polar.cancelSubscription(ctx, {
        revokeImmediately: args.revokeImmediately,
      });
      return null;
    } catch (error) {
      if (isAlreadyCanceledError(error)) {
        return null;
      }
      throwBillingError(error, "CANCEL_FAILED", "Could not cancel subscription");
    }
  },
});

/**
 * Change the current subscription product (monthly ↔ yearly).
 */
export const changeSubscription = action({
  args: {
    productId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireBillingUser(ctx);

    try {
      await polar.changeSubscription(ctx, { productId: args.productId });
      return null;
    } catch (error) {
      throwBillingError(error, "CHANGE_FAILED", "Could not change plan");
    }
  },
});

/**
 * Paginated order history for the signed-in Polar customer.
 */
export const listOrders = action({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: orderHistoryValidator,
  handler: async (ctx, args) => {
    const { userId } = await requireBillingUser(ctx);
    const page = Math.max(1, args.page ?? 1);
    const limit = Math.min(50, Math.max(1, args.limit ?? 10));

    const customer = await polar.getCustomerByUserId(ctx, userId);
    if (!customer) {
      return {
        items: [],
        page,
        maxPage: 1,
        totalCount: 0,
      };
    }

    try {
      const response = await unwrapResultIterator(
        ordersList(polar.polar, {
          customerId: customer.id,
          page,
          limit,
          sorting: ["-created_at"],
        }),
      );

      const list = response.result;
      return {
        items: list.items.map((order) => ({
          id: order.id,
          description: order.description || order.product?.name || "Order",
          status: order.status,
          createdAt: order.createdAt.toISOString(),
          totalAmount: order.totalAmount,
          currency: order.currency,
          paid: order.paid,
        })),
        page,
        maxPage: list.pagination.maxPage,
        totalCount: list.pagination.totalCount,
      };
    } catch (error) {
      if (error instanceof ConvexError) {
        throw error;
      }
      throwBillingError(error, "ORDERS_FAILED", "Could not load order history");
    }
  },
});

/**
 * Customer portal URL with stable error codes for the client.
 */
export const generateCustomerPortalUrl = action({
  args: {
    returnUrl: v.optional(v.string()),
  },
  returns: v.object({ url: v.string() }),
  handler: async (ctx, args) => {
    const { userId } = await requireBillingUser(ctx);

    try {
      return await polar.createCustomerPortalSession(ctx, {
        userId,
        returnUrl: args.returnUrl,
      });
    } catch (error) {
      throwBillingError(error, "PORTAL_FAILED", "Could not open Polar portal");
    }
  },
});
