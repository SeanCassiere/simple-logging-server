import type { ServerContext } from "@/types/hono.mjs";
import { Hono } from "hono";

import { lucia } from "@/config/lucia/index.mjs";

import githubAuthRouter from "./github.mjs";

const app = new Hono<ServerContext>();

app.route("/login/github", githubAuthRouter);

app.get("/logout", async (c) => {
  const session = c.get("session");
  if (!session) {
    return c.body(null, 401);
  }

  await lucia.invalidateSession(session.id);

  c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), { append: true });

  return c.redirect("/app");
});

export default app;
