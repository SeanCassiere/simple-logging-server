import { Hono } from "hono";
import { cors } from "hono/cors";
import { compress } from "hono/compress";
import { csrf } from "hono/csrf";
import { etag } from "hono/etag";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";
import { logger } from "hono/logger";
import { rateLimiter } from "hono-rate-limiter";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

import v2Router from "@/routers/v2";
import docsRouter from "@/routers/docs";

import { transformOpenapiYmlDoc, openapiYmlVersioner } from "@/utils/openapi-docs";
import { getPackageInfo } from "@/utils/package";
import { env } from "@/config/env";
import type { ServerContext } from "@/types/hono";

const packageJson = getPackageInfo();

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
  keyGenerator: (c) => c.req.header("x-app-service-id") ?? c.req.header("x-forwarded-for") ?? "",
});
app.use(limiter);

app.use("*", async (c, next) => {
  c.set("service", null);

  await next();
});

app.use("/api/", timeout(5000));

app.route("/api/v2", v2Router);
app.route("/docs", docsRouter);

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

if (env.FREEZE_DB_WRITES) {
  console.warn("\n🚨 Database writes are currently frozen!!!\n");
}

transformOpenapiYmlDoc("v2", [openapiYmlVersioner(packageJson.version)]);

const PORT = Number(env.PORT);
const HOST = env.NODE_ENV !== "production" ? "127.0.0.1" : "0.0.0.0";

serve(
  {
    fetch: app.fetch,
    port: PORT,
    hostname: HOST,
  },
  ({ address, port }) => {
    console.log(
      `🚀 ${packageJson.name} (${env.NODE_ENV} - ${packageJson.version}) listening at http://${address}:${port}`,
    );
  },
);
