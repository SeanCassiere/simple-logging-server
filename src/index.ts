import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { env } from "./config/env";

const packageJson = require("../package.json");

const app = new Hono();

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
