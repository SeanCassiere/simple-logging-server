import type { FC } from "hono/jsx";

import { RootDocument } from "../layouts/root-document.js";
import { Card } from "../components/card.js";
import { getButtonStyles } from "../components/button.js";
import { icons } from "../components/icons.js";

export const LoginPage: FC = () => {
  return (
    <RootDocument title="Login">
      <section class="mx-auto max-w-7xl h-full grid place-items-center">
        <Card class="max-w-md">
          <div class="p-4 border-b">
            <h2 class="text-2xl lg:text-3xl font-semibold pb-2 text-gray-900">Login</h2>
            <p class="text-gray-700 lg:text-sm">You must first sign in with GitHub to access the application.</p>
          </div>
          <div class="p-4">
            <a class={[getButtonStyles("primary"), "w-full gap-3"].join(" ")} href="/auth/login/github">
              <span>Login with GitHub</span>
              <icons.Github class="h-5 w-5 fill-white" />
            </a>
          </div>
        </Card>
      </section>
    </RootDocument>
  );
};
