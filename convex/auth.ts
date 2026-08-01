import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

import { sanitizeAvatarUrl } from "./lib/avatarUrl.js";
import { isSelfHosted } from "./lib/selfHosted.js";
import { claimTrialGrant } from "./lib/trial.js";

const providers = [Password, ...(process.env.AUTH_GOOGLE_ID ? [Google] : [])];

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers,
  callbacks: {
    afterUserCreatedOrUpdated: async (ctx, { userId }) => {
      const user = await ctx.db.get("users", userId);
      if (!user) {
        return;
      }
      if (user.email && !isSelfHosted()) {
        await claimTrialGrant(ctx, userId, user.email);
      }
      const safeImage = sanitizeAvatarUrl(user.image);
      if (user.image === safeImage || (user.image === undefined && safeImage === null)) {
        return;
      }
      // `patch` cannot unset optional fields; replace without a bad `image`.
      const {
        _id: _ignoredId,
        _creationTime: _ignoredCreation,
        image: _ignoredImage,
        ...rest
      } = user;
      if (safeImage) {
        await ctx.db.replace("users", userId, { ...rest, image: safeImage });
      } else {
        await ctx.db.replace("users", userId, rest);
      }
    },
  },
});
