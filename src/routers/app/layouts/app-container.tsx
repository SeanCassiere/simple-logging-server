import type { FC, PropsWithChildren } from "hono/jsx";
import type { User } from "lucia";

export interface AppContainerProps {
  user: User;
  workspace: string;
  mainClass?: string;
}

export const AppContainer: FC<PropsWithChildren<AppContainerProps>> = ({ user, children, mainClass, workspace }) => {
  return (
    <div class="flex flex-col md:grid md:grid-cols-4 lg:grid-cols-5 min-h-full">
      <aside class="h-[250px] border-b flex flex-col bg-gray-100 dark:bg-gray-800 md:h-auto md:col-span-1 md:border-r md:border-b-0">
        <div class="flex-grow p-2">
          <p class="pb-2">Hello {user.username}!</p>
          <p class="pb-2 border-b">Your organizations</p>
          <SidebarFetcher workspace={workspace} />
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

const SidebarFetcher: FC<{ workspace: string }> = ({ workspace }) => {
  const params = new URLSearchParams();
  params.append("style_current_workspace", workspace);

  const getUrl = `/app/hx/sidebar-organizations?${params.toString()}`;
  return (
    <div
      hx-get={getUrl}
      hx-trigger="load"
      hx-swap="innerHTML transition:true"
      style="view-transition-name:sidebar-organizations-list"
    />
  );
};
