import type { ServerContext } from "@/types/hono.mjs";
import { Hono } from "hono";

import { db } from "@/config/db/index.mjs";

import { HomePage } from "./pages/home.js";
import { LoginPage } from "./pages/login.js";

const app = new Hono<ServerContext>();

app.get("/login", async (c) => {
  const user = c.var.user;

  if (user) {
    return c.redirect("/app");
  }

  return c.html(<LoginPage />);
});

app.get("/", async (c) => {
  const user = c.var.user;

  if (!user) {
    return c.redirect("/app/login");
  }

  const services = await db.query.services.findMany({ orderBy: (fields, { desc }) => desc(fields.createdAt) });

  return c.html(<HomePage user={user} services={services} />);
});

export default app;
