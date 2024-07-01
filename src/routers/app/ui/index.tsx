import { Hono } from "hono";

import { db } from "@/config/db/index.mjs";

import { DashboardLandingPage } from "./pages/app.index.js";
import { LoginPage } from "./pages/app.login.js";
import { WorkspaceLandingPage } from "./pages/app.$workspace.index.js";
import { WorkspaceEditPage } from "./pages/app.$workspace.edit.js";
import { ServiceLandingPage } from "./pages/app.$workspace.$serviceId.index.js";
import { ServiceEditPage } from "./pages/app.$workspace.$serviceId.edit.js";

import { checkTenantMembership, checkUserAuthed, checkServiceTenantMembership } from "./utils/middleware.mjs";

import type { ServerContext } from "@/types/hono.mjs";

const app = new Hono<ServerContext>();

app.get("/", checkUserAuthed, async (c) => {
  const user = c.var.user!;
  const view_all = c.req.query("view_all") || "false";

  const relationships = await db.query.usersToTenants.findMany({
    where: (fields, { eq }) => eq(fields.userId, user.id),
    with: { tenant: true },
  });

  const tenants = relationships.map((r) => r.tenant);

  if (tenants.length === 1 && view_all !== "true") {
    const tenant = tenants[0];
    return c.redirect(`/app/${tenant.workspace}`);
  }

  return c.html(<DashboardLandingPage user={user} tenants={tenants} />);
});

app.get("/login", async (c) => {
  const user = c.var.user;

  if (user) {
    return c.redirect("/app");
  }

  return c.html(<LoginPage />);
});

app.get("/:workspace", checkUserAuthed, checkTenantMembership, async (c) => {
  const tenant = c.var.tenant!;
  const user = c.var.user!;

  const relationships = await db.query.usersToTenants.findMany({
    where: (fields, { eq }) => eq(fields.userId, user.id),
    with: { tenant: true },
  });

  const tenants = relationships.map((r) => r.tenant);

  const services = await db.query.services.findMany({
    where: (fields, { eq }) => eq(fields.tenantId, tenant.id),
  });

  return c.html(<WorkspaceLandingPage user={user} tenants={tenants} tenant={tenant} services={services} />);
});

app.get("/:workspace/edit", checkUserAuthed, checkTenantMembership, async (c) => {
  const tenant = c.var.tenant!;
  const user = c.var.user!;

  const relationships = await db.query.usersToTenants.findMany({
    where: (fields, { eq }) => eq(fields.userId, user.id),
    with: { tenant: true },
  });

  const tenants = relationships.map((r) => r.tenant);

  return c.html(<WorkspaceEditPage user={user} tenants={tenants} tenant={tenant} />);
});

app.get("/:workspace/:service_id", checkUserAuthed, checkTenantMembership, checkServiceTenantMembership, async (c) => {
  const tenant = c.var.tenant!;
  const service = c.var.service!;
  const user = c.var.user!;

  const relationships = await db.query.usersToTenants.findMany({
    where: (fields, { eq }) => eq(fields.userId, user.id),
    with: { tenant: true },
  });

  const tenants = relationships.map((r) => r.tenant);

  return c.html(<ServiceLandingPage user={user} tenant={tenant} tenants={tenants} service={service} />);
});

app.get(
  "/:workspace/:service_id/edit",
  checkUserAuthed,
  checkTenantMembership,
  checkServiceTenantMembership,
  async (c) => {
    const tenant = c.var.tenant!;
    const service = c.var.service!;
    const user = c.var.user!;

    const relationships = await db.query.usersToTenants.findMany({
      where: (fields, { eq }) => eq(fields.userId, user.id),
      with: { tenant: true },
    });

    const tenants = relationships.map((r) => r.tenant);

    return c.html(<ServiceEditPage user={user} tenant={tenant} tenants={tenants} service={service} />);
  },
);

export default app;
