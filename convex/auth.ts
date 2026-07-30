import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

import { claimTrialGrant } from "./lib/trial.js";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google],
  callbacks: {
    afterUserCreatedOrUpdated: async (ctx, { userId }) => {
      const user = await ctx.db.get("users", userId);
      if (user?.email) {
        await claimTrialGrant(ctx, userId, user.email);
      }
    },
  },
});
