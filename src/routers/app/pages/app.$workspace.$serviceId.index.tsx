import type { FC } from "hono/jsx";

import { RootDocument } from "../layouts/root-document.js";
import { Card } from "../components/card.js";
import { getButtonStyles } from "../components/button.js";
import { AppContainer, type AppContainerProps } from "../layouts/app-container.js";

import type { ServiceRecord } from "@/types/db.mjs";

export const ServiceLandingPage: FC<
  {
    service: ServiceRecord;
  } & AppContainerProps
> = ({ user, workspace, service }) => {
  return (
    <RootDocument title={`${service.name} - ${workspace}`}>
      <AppContainer user={user} workspace={workspace} mainClass="grid place-items-center p-2 md:p-4">
        <Card class="max-w-2xl w-full">
          <div class="p-4 grid gap-2">
            <div class="flex gap-1">
              <a class={getButtonStyles("secondary", "xs")} href={`/app/${workspace}`}>
                ⬅️ Back
              </a>
              <a class={getButtonStyles("secondary", "xs")} href={`/app/${workspace}/${service.id}/edit`}>
                ✏️ Edit service
              </a>
            </div>
            <h2 class="text-2xl lg:text-3xl font-semibold pb-2 text-gray-900">Service: {service.name}</h2>
            <p class="lg:text-sm text-gray-700">Service landing page.</p>
          </div>
        </Card>
      </AppContainer>
    </RootDocument>
  );
};
