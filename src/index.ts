import fastify from "fastify";

import { loggingRoutes } from "./components/logging/logging.routes";
import { env } from "./config/env";
const packageJson = require("../package.json");

const app = fastify({ logger: env.NODE_ENV !== "production" });

app.register(loggingRoutes, { prefix: "/api/logs" });

app.get("/", (_, reply) => {
  reply.code(200).send({ message: "Hello World" });
});

async function main() {
  try {
    app.listen(
      { port: Number(env.PORT), host: env.NODE_ENV !== "production" ? "127.0.0.1" : "0.0.0.0" },
      (err, address) => {
        if (err) {
          console.error(err);
          process.exit(1);
        }
        console.log(`${packageJson.name} (${env.NODE_ENV} - ${packageJson.version}) listening on ${address} `);
      }
    );
    console.log(
      `${packageJson.name} (${env.NODE_ENV} - ${packageJson.version}) is running and listening on port ${env.PORT} 🚀`
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
