import type { FC } from "hono/jsx";

import type { TenantRecord } from "@/types/db.mjs";

export const SidebarOrganizations: FC<{
  workspace: string;
  tenants: Array<TenantRecord>;
}> = ({ workspace, tenants }) => {
  return tenants.length > 0 ? (
    <ul>
      {tenants.map((item) => (
        <li>
          <a
            href={`/app/${item.workspace}`}
            class='block py-1 data-[active-tenant="true"]:text-blue-500'
            data-active-tenant={workspace.length ? item.workspace === workspace : false}
          >
            {item.name}
          </a>
        </li>
      ))}
    </ul>
  ) : (
    <p>😞 You have no organizations.</p>
  );
};
