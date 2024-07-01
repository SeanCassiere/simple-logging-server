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
    <div className="flex flex-col md:grid md:grid-cols-4 lg:grid-cols-5 min-h-full">
      <aside class="h-[250px] border-b flex flex-col bg-gray-100 dark:bg-gray-800 md:h-auto md:col-span-1 md:border-r md:border-b-0">
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
            <p>😞 You have no organizations.</p>
          )}
          <span class="border-t" />
        </div>
        <div class="p-2">
          <a href="/app/logout">👋🏼 Logout</a>
        </div>
      </aside>
      <main className={["md:col-span-3 lg:col-span-4", mainClass].filter(Boolean).join(" ")}>{children}</main>
    </div>
  );
};
