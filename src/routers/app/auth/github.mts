import { OAuth2RequestError, generateState } from "arctic";
import { Hono } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { z } from "zod";

import { db } from "@/config/db/index.mjs";
import {
  tenants as tenantsTable,
  users as usersTable,
  usersToTenants as usersToTenantsTable,
} from "@/config/db/schema.mjs";
import { env } from "@/config/env.mjs";
import { github, lucia } from "@/config/lucia/index.mjs";
import { createDbId } from "@/utils/db.mjs";

import type { ServerContext } from "@/types/hono.mjs";

const app = new Hono<ServerContext>();

app.get("/", async (c) => {
  const state = generateState();
  const url = await github.createAuthorizationURL(state);

  setCookie(c, "github_oauth_state", state, {
    path: "/",
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "Lax",
  });

  setCookie(c, "post_login_redirect", "/app", {
    path: "/",
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "Lax",
  });

  return c.redirect(url.toString());
});

const githubUserSchema = z.object({
  id: z.number(),
  login: z.string(),
});

app.get("/callback", async (c) => {
  const code = c.req.query("code")?.toString() ?? null;
  const state = c.req.query("state")?.toString() ?? null;
  const storedState = getCookie(c).github_oauth_state ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    return c.body(null, 400);
  }

  const postLoginRedirect = getCookie(c).post_login_redirect ?? "/app";

  try {
    const tokens = await github.validateAuthorizationCode(code);
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    const githubUserJson = await githubUserResponse.json();
    const githubUser = githubUserSchema.parse(githubUserJson);

    const existingUser = await db.query.users.findFirst({
      where: (fields, { eq }) => eq(fields.githubId, githubUser.id.toString()),
    });

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true });
      return c.redirect(postLoginRedirect);
    }

    const tenantId = createDbId("tenant");
    const userId = createDbId("user");

    await db.transaction(async (tx) => {
      // create the default tenant
      await tx.insert(tenantsTable).values({ id: tenantId, name: "default", workspace: tenantId });

      // create the user
      await tx
        .insert(usersTable)
        .values({ id: userId, githubId: githubUser.id.toString(), username: githubUser.login });

      // connect user to default tenant
      await tx.insert(usersToTenantsTable).values({ userId, tenantId });
    });

    const session = await lucia.createSession(userId, {});
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), { append: true });

    return c.redirect(postLoginRedirect);
  } catch (error) {
    if (error instanceof OAuth2RequestError && error.message === "bad_verification_code") {
      // invalid code
      return c.body(null, 400);
    }
    return c.body(null, 500);
  }
});

export default app;
