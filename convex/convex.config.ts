import { defineApp } from "convex/server";
import polar from "@convex-dev/polar/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import authz from "@djpanda/convex-authz/convex.config";

const app = defineApp();
app.use(authz);
app.use(rateLimiter);
app.use(polar);

export default app;
