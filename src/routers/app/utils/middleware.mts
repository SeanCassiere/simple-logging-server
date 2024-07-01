import { setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { db } from "@/config/db/index.mjs";
import { env } from "@/config/env.mjs";

import type { ServerContext } from "@/types/hono.mjs";

export const checkUserAuthed = createMiddleware<ServerContext>(async (c, next) => {
  const user = c.var.user;

  if (!user) {
    setCookie(c, "post_login_redirect", c.req.url, {
      path: "/",
      secure: env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: "Lax",
    });

    return c.redirect("/app/login");
  }

  return await next();
});

export const checkTenantMembership = createMiddleware<ServerContext>(async (c, next) => {
  const userId = c.var.user!.id;
  const workspace = c.req.param("workspace");

  const tenant = await db.query.tenants.findFirst({
    where: (fields, { eq }) => eq(fields.workspace, workspace),
  });

  if (!tenant) {
    return c.redirect("/app");
  }

  const relationship = await db.query.usersToTenants.findFirst({
    where: (fields, { and, eq }) => and(eq(fields.userId, userId), eq(fields.tenantId, tenant.id)),
  });

  if (!relationship) {
    return c.redirect("/app");
  }

  c.set("tenant", tenant);

  return await next();
});

export const checkServiceTenantMembership = createMiddleware<ServerContext>(async (c, next) => {
  const tenant = c.var.tenant!;
  const serviceId = c.req.param("service_id");

  const service = await db.query.services.findFirst({
    where: (fields, { and, eq }) => and(eq(fields.id, serviceId), eq(fields.tenantId, tenant.id)),
  });

  if (!service) {
    throw new HTTPException(404, { message: "Service not found." });
  }

  c.set("service", service);

  return await next();
});
