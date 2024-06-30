import { Hono } from "hono";

import { db } from "@/config/db/index.mjs";

import { DashboardLandingPage } from "./pages/dashboard-landing.js";
import { LoginPage } from "./pages/login.js";
import { checkTenantMembership, checkUserAuthed, checkServiceTenantMembership } from "./utils/middleware.mjs";
import { WorkspaceLandingPage } from "./pages/workspace-landing.js";

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
  const tenantId = c.req.param("workspace");
  return c.text(`Workspace "${tenantId}" edit page`);
});

app.get("/:workspace/:service_id", checkUserAuthed, checkTenantMembership, checkServiceTenantMembership, async (c) => {
  const serviceId = c.req.param("service_id");

  return c.text(`Service id: "${serviceId}" landing page`);
});

app.get(
  "/:workspace/:service_id/edit",
  checkUserAuthed,
  checkTenantMembership,
  checkServiceTenantMembership,
  async (c) => {
    const serviceId = c.req.param("service_id");

    return c.text(`Service id: "${serviceId}" edit page`);
  },
);

export default app;
