import type { FC } from "hono/jsx";

import { RootDocument } from "../layouts/root-document.js";

export const LoginPage: FC = () => {
  return (
    <RootDocument title="Login">
      <section class="mx-auto max-w-7xl">
        <div class="grid gap-2">
          <a href="/app/login/github">Login with Github</a>
          <a href="/app">← Go back</a>
        </div>
      </section>
    </RootDocument>
  );
};
