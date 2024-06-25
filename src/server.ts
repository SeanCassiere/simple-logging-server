import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { etag } from "hono/etag";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";

import authRouter from "@/routers/auth";
import docsRouter from "@/routers/docs";
import v2Router from "@/routers/v2";

import type { ServerContext } from "@/types/hono";

const app = new Hono<ServerContext>();
app.use(cors({ origin: "*" }));
app.use(compress());
app.use(csrf());
app.use(etag());
app.use(logger());
app.use(secureHeaders());

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: "draft-6",
  keyGenerator: (c) => c.req.header("CF-Connecting-IP") ?? c.req.header("x-forwarded-for") ?? "",
});

app.use("*", async (c, next) => {
  c.set("service", null);

  await next();
});

app.use("/api/", timeout(5000));

app.route("/api/v2", v2Router);

app.use(limiter);
app.route("/docs", docsRouter);
app.route("/auth", authRouter);

app.get(
  "/*",
  serveStatic({
    root: "./public",
  }),
);

app.get("/health", (c) => {
  return c.json({ message: "OK", uptime: process.uptime() });
});
app.get("/", (c) => {
  return c.redirect("/docs");
});

app.onError(function handleError(err, c) {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  c.status(500);
  return c.json({ success: false, message: "Unknown Internal Server Error" });
});

export default app;
