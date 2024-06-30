import type { ServerContext } from "@/types/hono.mjs";
import { Hono } from "hono";
import { html } from "hono/html";
import type { FC } from "hono/jsx";

import { db } from "@/config/db/index.mjs";

const app = new Hono<ServerContext>();

const Layout: FC = ({ children }) => {
  return (
    <html>
      <head>
        <script
          src="https://unpkg.com/htmx.org@1.9.10"
          integrity="sha384-D1Kt99CQMDuVetoL1lrYwg5t+9QdHe7NLX/SoJYkXDFfX37iInKRy5xLSi8nO7UC"
          crossorigin="anonymous"
        ></script>
        <script src="https://unpkg.com/htmx.org/dist/ext/json-enc.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
};

app.get("/login", async (c) => {
  const user = c.var.user;

  if (user) {
    return c.redirect("/app");
  }

  return c.html(
    <Layout>
      <div style="display: grid;gap: 0.5rem;">
        <a href="/app/login/github">Login with Github</a>
        <a href="/app">← Go back</a>
      </div>
    </Layout>,
  );
});

app.get("/", async (c) => {
  const user = c.var.user;

  const githubId = user?.githubId;
  const githubMessage =
    user && githubId ? `, ${user.username} with a github id of "${githubId}"` : " user with no github-id";

  const services = await db.query.services.findMany({ orderBy: (fields, { desc }) => desc(fields.createdAt) });

  return c.render(html`
    <div style="display: grid;gap: 0.5rem;">
      <p>${`Hello${user ? githubMessage : " stranger"}!`}</p>
      ${user ? html`<a href="/app/logout">Logout 👋🏼</a>` : html`<a href="/app/login">Login 🔑</a>`}
      ${user
        ? html`
            <table style="text-align: left;">
              <tr>
                <th>Name</th>
                <th>Created at</th>
              </tr>
              ${services.map(
                (service) =>
                  html`<tr>
                    <td>${service.name}</td>
                    <td>${service.createdAt}</td>
                  </tr>`,
              )}
            </table>
          `
        : ""}
    </div>
  `);
});

export default app;
