import fastify from "fastify";
import swagger from "@fastify/swagger";
import rateLimit from "@fastify/rate-limit";
import { withRefResolver } from "fastify-zod";

import { env } from "./config/env";

import { serviceRoutes } from "./components/services/services.routes";

import { logSchemas } from "./components/logging/logging.schema";
import { serviceSchemas } from "./components/services/services.schema";

const packageJson = require("../package.json");

const app = fastify({
  logger: env.NODE_ENV !== "production",
  // logger: false,
});

app.register(rateLimit, {
  max: 50,
  timeWindow: "1 minute",
  // ...(env.NODE_ENV !== "production" ? { allowList: ["127.0.0.1", "localhost"] } : {}),
});

app.get("/health", async (_, reply) => {
  reply.code(200).send({
    status: "ok",
    uptime: process.uptime() ?? 0,
  });
});

for (const schema of [...logSchemas, ...serviceSchemas]) {
  app.addSchema(schema);
}

app.register(
  swagger,
  withRefResolver({
    routePrefix: "/docs",
    exposeRoute: true,
    staticCSP: true,
    openapi: {
      info: {
        title: "Logging API",
        version: packageJson.version,
      },
    },
  })
);

app.register(serviceRoutes, { prefix: "/api/services" });

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
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
