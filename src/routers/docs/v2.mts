import { apiReference } from "@scalar/hono-api-reference";
import { Hono } from "hono";

import type { ServerContext } from "@/types/hono.mjs";

const app = new Hono<ServerContext>();

app.get(
  "/",
  apiReference({
    pageTitle: "Simple Logging Server API Reference",
    theme: "purple",
    spec: {
      url: "/static/openapi.v2.yaml",
    },
  }),
);

export default app;
