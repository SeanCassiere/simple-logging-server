import type { FC } from "hono/jsx";

import { RootDocument } from "../layouts/root-document.js";
import { AppContainer, type AppContainerProps } from "../layouts/app-container.js";
import { Button } from "../components/button.js";

export const NoOrganizationPage: FC<{} & Omit<AppContainerProps, "tenant">> = ({ user, workspace }) => {
  return (
    <RootDocument title="Simple Logging Server">
      <AppContainer user={user} workspace={workspace} mainClass="p-2 md:p-4">
        <div class="grid gap-2">
          <p>You are not a part of any active organizations.</p>
          <p>Create your own organization!.</p>
          <Button class="w-auto">Create organization</Button>
        </div>
      </AppContainer>
    </RootDocument>
  );
};
