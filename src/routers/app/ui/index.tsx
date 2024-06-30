import { Hono } from "hono";

import { db } from "@/config/db/index.mjs";

import { DashboardLandingPage } from "./pages/dashboard-landing.js";
import { LoginPage } from "./pages/login.js";
import { WorkspaceLandingPage } from "./pages/workspace-landing.js";
import { WorkspaceEditPage } from "./pages/workspace-edit.js";
import { ServiceLandingPage } from "./pages/service-landing.js";
import { ServiceEditPage } from "./pages/service-edit.js";

import { checkTenantMembership, checkUserAuthed, checkServiceTenantMembership } from "./utils/middleware.mjs";

import type { ServerContext } from "@/types/hono.mjs";

const app = new Hono<ServerContext>();

app.get("/", checkUserAuthed, async (c) => {
  const user = c.var.user!;

  const relationships = await db.query.usersToTenants.findMany({
    where: (fields, { eq }) => eq(fields.userId, user.id),
    with: { tenant: true },
  });

  const tenants = relationships.map((r) => r.tenant);

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

  const services = await db.query.services.findMany({
    where: (fields, { eq }) => eq(fields.tenantId, tenant.id),
  });

  return c.html(<WorkspaceLandingPage tenant={tenant} services={services} />);
});

app.get("/:workspace/edit", checkUserAuthed, checkTenantMembership, async (c) => {
  const tenant = c.var.tenant!;

  return c.html(<WorkspaceEditPage tenant={tenant} />);
});

app.get("/:workspace/:service_id", checkUserAuthed, checkTenantMembership, checkServiceTenantMembership, async (c) => {
  const tenant = c.var.tenant!;
  const service = c.var.service!;

  return c.html(<ServiceLandingPage tenant={tenant} service={service} />);
});

app.get(
  "/:workspace/:service_id/edit",
  checkUserAuthed,
  checkTenantMembership,
  checkServiceTenantMembership,
  async (c) => {
    const tenant = c.var.tenant!;
    const service = c.var.service!;

    return c.html(<ServiceEditPage tenant={tenant} service={service} />);
  },
);

export default app;
