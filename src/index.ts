import { serve } from "@hono/node-server";

import { env } from "@/config/env";
import { openapiYmlVersioner, transformOpenapiYmlDoc } from "@/utils/openapi-docs";
import { getPackageInfo } from "@/utils/package";

const packageJson = getPackageInfo();

import server from "./server";

if (env.FREEZE_DB_WRITES) {
  console.warn("\n🚨 Database writes are currently frozen!!!\n");
}

transformOpenapiYmlDoc("v2", [openapiYmlVersioner(packageJson.version)]);

const PORT = Number(env.PORT);
const HOST = env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";

serve(
  {
    fetch: server.fetch,
    port: PORT,
    hostname: HOST,
  },
  ({ address, port }) => {
    console.log(
      `🚀 ${packageJson.name} (${env.NODE_ENV} - ${packageJson.version}) listening at http://${address}:${port}`,
    );
  },
);
