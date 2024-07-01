import type { FC, PropsWithChildren } from "hono/jsx";
import { User } from "lucia";

import type { TenantRecord } from "@/types/db.mjs";

export interface AppContainerProps {
  user: User;
  tenant: TenantRecord | null;
  tenants: Array<TenantRecord>;
  mainClass?: string;
}

export const AppContainer: FC<PropsWithChildren<AppContainerProps>> = ({
  user,
  tenant,
  tenants,
  children,
  mainClass,
}) => {
  return (
    <div className="grid grid-cols-5 min-h-full">
      <aside class="col-span-1 border-r flex flex-col bg-gray-100 dark:bg-gray-800">
        <div class="flex-grow p-2">
          <p class="pb-2">Hello {user.username}!</p>
          <p class="pb-2 border-b">Your organizations</p>
          {tenants.length > 0 ? (
            <ul>
              {tenants.map((item) => (
                <li>
                  <a
                    href={`/app/${item.workspace}`}
                    class='block py-1 data-[active-tenant="true"]:text-blue-500'
                    data-active-tenant={tenant ? item.id === tenant.id : false}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>You are not a part of any organizations.</p>
          )}
          <span class="border-t" />
        </div>
        <div class="p-2">
          <a href="/app/logout">👋🏼 Logout</a>
        </div>
      </aside>
      <main className={["col-span-4", mainClass].filter(Boolean).join(" ")}>{children}</main>
    </div>
  );
};
