import type { FC } from "hono/jsx";

import { RootDocument } from "../layouts/root-document.js";
import { AppContainer, type AppContainerProps } from "../layouts/app-container.js";

export const DashboardLandingPage: FC<{} & Omit<AppContainerProps, "tenant">> = ({ user, tenants }) => {
  return (
    <RootDocument title="Simple Logging Server">
      <AppContainer user={user} tenants={tenants} tenant={null}>
        <p>There is no content on this page</p>
      </AppContainer>
    </RootDocument>
  );
};
