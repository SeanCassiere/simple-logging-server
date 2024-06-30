import type { FC } from "hono/jsx";

import { RootDocument } from "../layouts/root-document.js";
import { Card } from "../components/card.js";
import { getButtonStyles } from "../components/button.js";
import { dateFormatter } from "../utils/date.mjs";

import type { ServiceRecord, TenantRecord } from "@/types/db.mjs";

export const WorkspaceLandingPage: FC<{
  tenant: TenantRecord;
  services: Array<ServiceRecord>;
}> = ({ tenant, services }) => {
  return (
    <RootDocument title="Simple Logging Server">
      <section class="mx-auto max-w-7xl h-full grid place-items-center px-2">
        <Card class="lg:max-w-2xl w-full">
          <div class="p-4">
            <h2 class="text-2xl lg:text-3xl font-semibold pb-2 text-gray-900">{tenant.name}</h2>
            <p class="lg:text-sm pb-2 text-gray-700">These are the services for {tenant.name}</p>
            <div class="flex gap-1">
              <a class={getButtonStyles("secondary", "xs")} href="/app/logout">
                Logout 👋🏼
              </a>
              <a class={getButtonStyles("secondary", "xs")} href={`/app/${tenant.workspace}/edit`}>
                Edit ✏️
              </a>
            </div>
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
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8">
                    <span class="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                {services.map((service) => (
                  <tr>
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                      <a
                        href={`/app/${tenant.workspace}/${service.name}`}
                        class="text-indigo-600 hover:text-indigo-900 hover:underline"
                      >
                        {service.name}
                      </a>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {dateFormatter.humanReadable(new Date(service.createdAt))}
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">
                      <a
                        href={`/app/${tenant.workspace}/${service.id}/edit`}
                        class="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit<span class="sr-only">, {service.name}</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </RootDocument>
  );
};
