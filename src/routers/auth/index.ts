import type { ServerContext } from "@/types/hono";
import { Hono } from "hono";

import { db } from "@/config/db";
import { lucia } from "@/config/lucia";

import githubLoginRouter from "./github";

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

app.route("/login/github", githubLoginRouter);

app.get("/login", async (c) => {
  const user = c.var.user;

  const users = await db.query.users.findMany({
    orderBy: (fields, { desc }) => desc(fields.createdAt),
    with: {
      usersToTenants: true,
    },
  });
  return c.json({ user, users });
});

app.get("/logout", async (c) => {
  const session = c.get("session");
  if (!session) {
    return c.body(null, 401);
  }

  await lucia.invalidateSession(session.id);

  c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), { append: true });

  return c.redirect("/login");
});

export default app;
