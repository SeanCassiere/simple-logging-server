import type { FC } from "hono/jsx";
import type { User } from "lucia";

import { RootDocument } from "../layouts/root-document.js";
import { Card } from "../components/card.js";
import { getButtonStyles } from "../components/button.js";
import { dateFormatter } from "../utils/date.mjs";

import type { TenantRecord } from "@/types/db.mjs";

export const DashboardLandingPage: FC<{
  user: User;
  tenants: Array<TenantRecord>;
}> = ({ user, tenants }) => {
  const githubId = user.githubId;
  const githubMessage =
    user && githubId ? `, ${user.username} with a github id of "${githubId}"` : " user with no github-id";

  return (
    <RootDocument title="Simple Logging Server">
      <section class="mx-auto max-w-7xl h-full grid place-items-center px-2">
        <Card class="lg:max-w-2xl w-full">
          <div class="p-4 grid gap-2">
            <h2 class="text-2xl lg:text-3xl font-semibold pb-2 text-gray-900">Organizations</h2>
            <p class="lg:text-sm text-gray-700">{`Hello${githubMessage}`}</p>
            <div>
              <a class={getButtonStyles("secondary", "xs")} href="/app/logout">
                Logout 👋🏼
              </a>
            </div>
            <p class="lg:text-sm text-gray-700">Select the organization you want to view or edit.</p>
          </div>
          <div class="border-t overflow-hidden">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"
                  >
                    Name
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
                {tenants.map((tenant) => (
                  <tr>
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                      <a
                        href={`/app/${tenant.workspace}`}
                        class="text-indigo-600 hover:text-indigo-900 hover:underline"
                      >
                        {tenant.name}
                      </a>
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {dateFormatter.humanReadable(tenant.createdAt)}
                    </td>
                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">
                      <a href={`/app/${tenant.workspace}/edit`} class="text-indigo-600 hover:text-indigo-900">
                        Edit<span class="sr-only">, {tenant.name}</span>
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
