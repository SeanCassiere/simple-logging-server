import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";

import type { ServerContext } from "@/types/hono.mjs";

import logsRouter from "./logging/index.mjs";
import servicesRouter from "./services/index.mjs";

const app = new Hono<ServerContext>();

const limiter = rateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 100,
  standardHeaders: "draft-6",
  keyGenerator: (c) => {
    return (
      c.req.header("x-app-service-id") ?? c.req.header("CF-Connecting-IP") ?? c.req.header("x-forwarded-for") ?? ""
    );
  },
});
app.use(limiter);

app.route("/service", servicesRouter);
app.route("/log", logsRouter);

export default app;
