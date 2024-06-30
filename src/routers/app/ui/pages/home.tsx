import type { FC } from "hono/jsx";
import { services } from "@/config/db/schema.mjs";

import { RootDocument } from "../layouts/root-document.js";
import { Card } from "../components/card.js";
import { getButtonStyles } from "../components/button.js";

import type { ServerContext } from "@/types/hono.mjs";

type ServiceItem = typeof services.$inferSelect;

function intlDateFormatter(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(new Date(date));
}

export const HomePage: FC<{ user: NonNullable<ServerContext["Variables"]["user"]>; services: Array<ServiceItem> }> = ({
  user,
  services,
}) => {
  const githubId = user.githubId;
  const githubMessage =
    user && githubId ? `, ${user.username} with a github id of "${githubId}"` : " user with no github-id";

  return (
    <RootDocument title="Simple Logging Server">
      <section class="mx-auto max-w-7xl h-full grid place-items-center px-2">
        <Card class="lg:max-w-2xl w-full">
          <div class="p-4">
            <h2 class="text-2xl lg:text-3xl font-semibold pb-2 text-gray-900">Welcome!!!</h2>
            <p class="lg:text-sm pb-2 text-gray-700">{`Hello${githubMessage}`}</p>
            <a class={getButtonStyles("secondary", "xs")} href="/app/logout">
              Logout 👋🏼
            </a>
          </div>
          {user ? (
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
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                  {services.map((service) => (
                    <tr>
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                        {service.name}
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {intlDateFormatter(service.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>
      </section>
    </RootDocument>
  );
};
