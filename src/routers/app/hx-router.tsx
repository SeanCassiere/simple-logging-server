import { Hono } from "hono";

import { db } from "@/config/db/drizzle.mjs";
import type { ServerContext } from "@/types/hono.mjs";

import { SidebarOrganizations } from "./components/sidebar-organizations.js";

import { checkUserAuthed } from "./utils/middleware.mjs";

const app = new Hono<ServerContext>();

app.get("/sidebar-organizations", checkUserAuthed, async (c) => {
  const user = c.var.user!;

  // DO NOT USE THIS PARAMETER FOR AUTH
  // THIS IS PURELY BEING USED FOR STYLING
  const workspace = c.req.query("current_workspace") || "";

  const relationships = await db.query.usersToTenants.findMany({
    where: (fields, { eq }) => eq(fields.userId, user.id),
    with: { tenant: true },
  });

  const tenants = relationships.map((r) => r.tenant);

  return c.html(<SidebarOrganizations workspace={workspace} tenants={tenants} />);
});

export default app;
