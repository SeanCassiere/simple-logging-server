import fastify from "fastify";

import { loggingRoutes } from "./components/logging/logging.routes";
import { env } from "./config/env";
const packageJson = require("../package.json");

const app = fastify({
  maxParamLength: 5000,
});

app.register(loggingRoutes, { prefix: "/api/logs" });

async function main() {
  try {
    await app.listen({ port: Number(env.PORT) });
    console.log(
      `${packageJson.name} (${env.NODE_ENV} - ${packageJson.version}) is running and listening on port ${env.PORT} 🚀`
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
