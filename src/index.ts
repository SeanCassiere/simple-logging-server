import fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import { register } from "fastify-zod";

import fastifyZodCompiled from "./config/fastify-zod";

import { env } from "./config/env";
import { serviceRoutes } from "./components/services/services.routes";
import { logRoutes } from "./components/logging/logging.routes";

const packageJson = require("../package.json");

const server = fastify({
  logger: env.NODE_ENV !== "production",
});

async function main() {
  server.register(rateLimit, {
    max: 50,
    timeWindow: "1 minute",
    ...(env.NODE_ENV !== "production" ? { allowList: ["127.0.0.1", "localhost"] } : {}),
  });

  server.get("/health", async (_, reply) => {
    reply.code(200).send({
      status: "ok",
      uptime: process.uptime() ?? 0,
    });
  });

  await register(server, {
    jsonSchemas: fastifyZodCompiled,
    swaggerOptions: {
      exposeRoute: true,
      routePrefix: "/docs",
      staticCSP: true,
      uiConfig: {
        docExpansion: "list",
        displayRequestDuration: true,
        displayOperationId: true,
      },
      openapi: {
        info: {
          title: "Logging API",
          version: packageJson?.version || "1.0.0-alpha.1",
          description: `
This is a simple API for logging messages. It is intended to be a basic interface for logging messages according to an allowed list of clients.
### Usage
All functions on this server is tied to your \`ServiceID\`. To get your own \`ServiceID\`, please DM me on [Twitter](https://twitter.com/SeanCassiere).`,
          license: {
            name: "MIT",
            url: "https://github.com/SeanCassiere/simple-logging-server/blob/master/LICENSE.md",
          },
        },
        externalDocs: {
          description: "GitHub Repository",
          url: "https://github.com/SeanCassiere/simple-logging-server",
        },
      },
      hideUntagged: true,
    },
  });

  server.register(logRoutes, { prefix: "/api/logs" });
  server.register(serviceRoutes, { prefix: "/api/services" });

  server.get("/swagger", (_, reply) => {
    reply.code(302).redirect("/docs");
  });
  server.get("/", (_, reply) => {
    reply.code(302).redirect("/docs");
  });

  try {
    server.listen(
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

main().catch((err) => console.error(err));
