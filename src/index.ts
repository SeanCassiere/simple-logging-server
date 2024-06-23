import { Hono } from "hono";
import { serve } from "@hono/node-server";

import v2Router from "@/v2";
import { env } from "@/config/env";

import type { ServerContext } from "@/types/hono";

const packageJson = require("../package.json");

const app = new Hono<ServerContext>();

app.route("/api/v2", v2Router);

app.get("/docs/v2", (c) => {
  return c.json({ docs: "docs for the v2 api" });
});

app.get("/health", (c) => {
  return c.json({ message: "OK", uptime: process.uptime() });
});

app.get("/", (c) => {
  return c.json({ message: "hello world" });
});

if (env.FREEZE_DB_WRITES) {
  console.warn("  ⚠️ ⚠️ ⚠️ ⚠️\n  Database writes are currently frozen\n  ⚠️ ⚠️ ⚠️ ⚠️\n");
}

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
