import type { ServerContext } from "@/types/hono.mjs";
import { Hono } from "hono";

import { lucia } from "@/config/lucia/index.mjs";

import authRouter from "./auth/index.mjs";
import uiRouter from "./ui/index.js";

const app = new Hono<ServerContext>();

app.use("*", async (c, next) => {
  const sessionId = lucia.readSessionCookie(c.req.header("Cookie") ?? "");
  if (!sessionId) {
    c.set("user", null);
    c.set("session", null);
    return await next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true });
  }

  if (!session) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), { append: true });
  }

  c.set("user", user);
  c.set("session", session);

  return await next();
});

app.route("", authRouter);
app.route("", uiRouter);

export default app;
