import { Hono } from "hono";

import type { ServerContext } from "@/types/hono.mjs";

import v2DocsRouter from "./v2.mjs";

const app = new Hono<ServerContext>();

app.route("/v2", v2DocsRouter);

app.get("/", (c) => {
  return c.redirect("/docs/v2");
});

export default app;
