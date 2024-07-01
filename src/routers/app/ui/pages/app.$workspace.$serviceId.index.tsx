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
> = ({ user, tenant, tenants, service }) => {
  return (
    <RootDocument title="Simple Logging Server">
      <AppContainer user={user} tenant={tenant} tenants={tenants} mainClass="grid place-items-center px-2">
        <Card class="max-w-2xl w-full">
          <div class="p-4 grid gap-2">
            <div class="flex gap-1">
              <a class={getButtonStyles("secondary", "xs")} href={`/app/${tenant?.workspace}`}>
                ⬅️ Back
              </a>
              <a class={getButtonStyles("secondary", "xs")} href={`/app/${tenant?.workspace}/${service.id}/edit`}>
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
