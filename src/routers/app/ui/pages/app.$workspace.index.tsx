import type { FC } from "hono/jsx";

import { RootDocument } from "../layouts/root-document.js";
import { Card } from "../components/card.js";
import { getButtonStyles } from "../components/button.js";
import { dateFormatter } from "../utils/date.mjs";
import { AppContainer, type AppContainerProps } from "../layouts/app-container.js";

import type { ServiceRecord, TenantRecord } from "@/types/db.mjs";

export const WorkspaceLandingPage: FC<
  {
    tenant: TenantRecord;
    services: Array<ServiceRecord>;
  } & AppContainerProps
> = ({ user, tenants, tenant, services }) => {
  return (
    <RootDocument title={`${tenant.name}`}>
      <AppContainer user={user} tenants={tenants} mainClass="grid place-items-center">
        <Card class="lg:max-w-4xl w-full">
          <div class="p-4 grid gap-2">
            <h2 class="text-2xl lg:text-3xl font-semibold pb-2 text-gray-900">Services</h2>
            <p class="lg:text-sm text-gray-700">These are the services managed by this organization ({tenant.name}).</p>
            <div class="flex gap-1">
              <a class={getButtonStyles("secondary", "xs")} href={`/app/${tenant.workspace}/edit`}>
                Edit organization ✏️
              </a>
            </div>
            <p class="lg:text-sm text-gray-700">
              You can view and edit the services managed by this organization here.
            </p>
          </div>
          <div class="border-t overflow-hidden">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                  >
                    Service name
                  </th>
                  <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Created at
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                {services.map((service) => (
                  <tr>
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                      <a
                        href={`/app/${tenant.workspace}/${service.id}`}
                        class="text-indigo-600 hover:text-indigo-900 hover:underline"
                      >
                        {service.name}
                      </a>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {dateFormatter.humanReadable(new Date(service.createdAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </AppContainer>
    </RootDocument>
  );
};
