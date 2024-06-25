import type { ServerContext } from "@/types/hono";
import { Hono } from "hono";

const app = new Hono<ServerContext>();

app.get("/", (c) => {
  const user = c.var.user;

  const githubId = user?.githubId;
  const githubMessage =
    user && githubId ? `, ${user.username} with a github id of "${githubId}"` : " user with no github-id";

  return c.text(`Hello${user ? githubMessage : " stranger"}!`);
});

export default app;
