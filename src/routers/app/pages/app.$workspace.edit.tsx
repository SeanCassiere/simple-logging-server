import type { FC } from "hono/jsx";

import { RootDocument } from "../layouts/root-document.js";
import { Card } from "../components/card.js";
import { getButtonStyles } from "../components/button.js";
import { AppContainer, type AppContainerProps } from "../layouts/app-container.js";

import type { TenantRecord } from "@/types/db.mjs";

export const WorkspaceEditPage: FC<{ tenant: TenantRecord } & AppContainerProps> = ({ user, workspace, tenant }) => {
  return (
    <RootDocument title={`${workspace} edit`}>
      <AppContainer user={user} workspace={workspace} mainClass="grid place-items-center p-2 md:p-4">
        <Card class="max-w-2xl w-full">
          <div class="p-4 grid gap-2">
            <div class="flex gap-1">
              <a class={getButtonStyles("secondary", "xs")} href={`/app/${workspace}`}>
                ⬅️ Back
              </a>
            </div>
            <h2 class="text-2xl lg:text-3xl font-semibold pb-2 text-gray-900">Edit the "{tenant.name}" organization</h2>
            <p class="text-gray-700 lg:text-sm">You can edit the organization here.</p>
          </div>
        </Card>
      </AppContainer>
    </RootDocument>
  );
};
