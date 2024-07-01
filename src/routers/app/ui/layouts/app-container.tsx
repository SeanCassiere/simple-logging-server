import type { FC, PropsWithChildren } from "hono/jsx";
import { User } from "lucia";

import type { TenantRecord } from "@/types/db.mjs";

export interface AppContainerProps {
  user: User;
  tenants: Array<TenantRecord>;
}

export const AppContainer: FC<PropsWithChildren<AppContainerProps>> = ({ user, tenants, children }) => {
  return (
    <div className="grid grid-cols-5 min-h-full">
      <aside class="col-span-1 bg-gray-800 border-r flex flex-col">
        <div class="flex-grow p-2">
          <p class="pb-2">Hello {user.username}!</p>
          <p class="pb-2 border-b">Your organizations</p>
          {tenants.length > 0 ? (
            <ul>
              {tenants.map((tenant) => (
                <li>
                  <a href={`/app/${tenant.workspace}`}>{tenant.name}</a>
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
      <main className="col-span-4">{children}</main>
    </div>
  );
};
