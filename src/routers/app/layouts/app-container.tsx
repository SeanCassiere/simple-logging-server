import type { FC, PropsWithChildren } from "hono/jsx";
import { User } from "lucia";

export interface AppContainerProps {
  user: User;
  workspace: string;
  mainClass?: string;
}

export const AppContainer: FC<PropsWithChildren<AppContainerProps>> = (props) => {
  const { user, children, mainClass } = props;

  return (
    <div class="flex flex-col md:grid md:grid-cols-4 lg:grid-cols-5 min-h-full">
      <aside class="h-[250px] border-b flex flex-col bg-gray-100 dark:bg-gray-800 md:h-auto md:col-span-1 md:border-r md:border-b-0">
        <div class="flex-grow p-2">
          <p class="pb-2">Hello {user.username}!</p>
          <p class="pb-2 border-b">Your organizations</p>
          <SidebarFetcher {...props} />
          <span class="border-t" />
        </div>
        <div class="p-2">
          <a href="/auth/logout">👋🏼 Logout</a>
        </div>
      </aside>
      <main class={["md:col-span-3 lg:col-span-4", mainClass].filter(Boolean).join(" ")}>{children}</main>
    </div>
  );
};

const SidebarFetcher: FC<Pick<AppContainerProps, "user" | "workspace">> = ({ user, workspace }) => {
  return (
    <div
      hx-trigger="load"
      hx-get={["/app/hx/sidebar-organizations", workspace.length > 0 ? `?current_workspace=${workspace}` : ""].join("")}
    ></div>
  );
};
