import type { FC } from "hono/jsx";

import { RootDocument } from "../layouts/root-document.js";
import { Card } from "../components/card.js";
import { getButtonStyles } from "../components/button.js";

import type { TenantRecord } from "@/types/db.mjs";

export const WorkspaceEditPage: FC<{ tenant: TenantRecord }> = ({ tenant }) => {
  return (
    <RootDocument title={`${tenant.name} edit`}>
      <section class="mx-auto max-w-7xl h-full grid place-items-center">
        <Card class="max-w-md">
          <div class="p-4 grid gap-2">
            <h2 class="text-2xl lg:text-3xl font-semibold pb-2 text-gray-900">"{tenant.name}" Workspace Edit</h2>
            <p class="text-gray-700 lg:text-sm">You can edit the workspace here.</p>
            <div class="flex gap-1">
              <a class={getButtonStyles("secondary", "xs")} href={`/app/${tenant.workspace}`}>
                Back ⬅️
              </a>
            </div>
          </div>
        </Card>
      </section>
    </RootDocument>
  );
};
