import type { FC } from "hono/jsx";

import { RootDocument } from "../layouts/root-document.js";
import { Card } from "../components/card.js";
import { getButtonStyles } from "../components/button.js";

import type { ServiceRecord, TenantRecord } from "@/types/db.mjs";

export const ServiceLandingPage: FC<{
  tenant: TenantRecord;
  service: ServiceRecord;
}> = ({ service, tenant }) => {
  return (
    <RootDocument title="Simple Logging Server">
      <section class="mx-auto max-w-7xl h-full grid place-items-center px-2">
        <Card class="lg:max-w-2xl w-full">
          <div class="p-4 grid gap-2">
            <h2 class="text-2xl lg:text-3xl font-semibold pb-2 text-gray-900">Service: {service.name}</h2>
            <p class="lg:text-sm text-gray-700">Service landing page.</p>
            <div class="flex gap-1">
              <a class={getButtonStyles("secondary", "xs")} href="/app/logout">
                Logout 👋🏼
              </a>
              <a class={getButtonStyles("secondary", "xs")} href={`/app/${tenant.workspace}`}>
                Back ⬅️
              </a>
              <a class={getButtonStyles("secondary", "xs")} href={`/app/${tenant.workspace}/${service.id}/edit`}>
                Edit ✏️
              </a>
            </div>
          </div>
        </Card>
      </section>
    </RootDocument>
  );
};
