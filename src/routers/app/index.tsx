import { Hono } from "hono";

import { sessionMiddleware } from "@/routers/auth/middleware.mjs";
import { db } from "@/config/db/index.mjs";

import { NoOrganizationPage } from "./pages/app.index.js";
import { LoginPage } from "./pages/app.login.js";
import { WorkspaceLandingPage } from "./pages/app.$workspace.index.js";
import { WorkspaceEditPage } from "./pages/app.$workspace.edit.js";
import { ServiceLandingPage } from "./pages/app.$workspace.$serviceId.index.js";
import { ServiceEditPage } from "./pages/app.$workspace.$serviceId.edit.js";

import { checkTenantMembership, checkUserAuthed, checkServiceTenantMembership } from "./utils/middleware.mjs";

import hxRouter from "./hx-router.js";

import type { ServerContext } from "@/types/hono.mjs";

const app = new Hono<ServerContext>();

app.use("*", sessionMiddleware);

app.route("/hx", hxRouter);

app.get("/", checkUserAuthed, async (c) => {
  const user = c.var.user!;
  const view_all = c.req.query("view_all") || "false";

  const relationships = await db.query.usersToTenants.findMany({
    where: (fields, { eq }) => eq(fields.userId, user.id),
    with: { tenant: true },
  });

  const tenants = relationships.map((r) => r.tenant);

  if (tenants.length >= 1 && view_all !== "true") {
    const tenant = tenants[0];
    return c.redirect(`/app/${tenant.workspace}`);
  }

  return c.html(<NoOrganizationPage user={user} workspace="" />);
});

app.get("/login", async (c) => {
  const user = c.var.user;

  if (user) {
    return c.redirect("/app");
  }

  return c.html(<LoginPage />);
});

app.get("/:workspace", checkUserAuthed, checkTenantMembership, async (c) => {
  const workspace = c.req.param("workspace");
  const tenant = c.var.tenant!;
  const user = c.var.user!;

  const services = await db.query.services.findMany({
    where: (fields, { eq }) => eq(fields.tenantId, tenant.id),
  });

  return c.html(<WorkspaceLandingPage user={user} workspace={workspace} tenant={tenant} services={services} />);
});

app.get("/:workspace/edit", checkUserAuthed, checkTenantMembership, async (c) => {
  const workspace = c.req.param("workspace");
  const tenant = c.var.tenant!;
  const user = c.var.user!;

  return c.html(<WorkspaceEditPage user={user} workspace={workspace} tenant={tenant} />);
});

app.get("/:workspace/:service_id", checkUserAuthed, checkTenantMembership, checkServiceTenantMembership, async (c) => {
  const workspace = c.req.param("workspace");
  const service = c.var.service!;
  const user = c.var.user!;

  return c.html(<ServiceLandingPage user={user} workspace={workspace} service={service} />);
});

app.get(
  "/:workspace/:service_id/edit",
  checkUserAuthed,
  checkTenantMembership,
  checkServiceTenantMembership,
  async (c) => {
    const workspace = c.req.param("workspace");
    const service = c.var.service!;
    const user = c.var.user!;

    return c.html(<ServiceEditPage user={user} workspace={workspace} service={service} />);
  },
);

export default app;
