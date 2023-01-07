import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import { register } from "fastify-zod";

import fastifyZodCompiled from "./fastify-zod";

import { env } from "./env";
import { serviceRoutes } from "../components/services/services.routes";
import { logRoutes } from "../components/logging/logging.routes";

type MakeFastifyServerProps = {
  packageVersion?: string;
};
export async function makeFastifyServer(props: MakeFastifyServerProps) {
  const { packageVersion = "0.0.1-alpha.1" } = props;

  const fastify = Fastify({
    logger: env.NODE_ENV !== "production",
  });

  fastify.register(rateLimit, {
    max: 50,
    timeWindow: "1 minute",
    ...(env.NODE_ENV !== "production" ? { allowList: ["127.0.0.1", "localhost"] } : {}),
  });

  fastify.get("/health", async (_, reply) => {
    reply.code(200).send({
      status: "ok",
      uptime: process.uptime() ?? 0,
    });
  });

  await register(fastify, {
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
          version: packageVersion,
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

  fastify.register(logRoutes, { prefix: "/api/logs" });
  fastify.register(serviceRoutes, { prefix: "/api/services" });

  fastify.get("/swagger", (_, reply) => {
    reply.code(302).redirect("/docs");
  });
  fastify.get("/", (_, reply) => {
    reply.code(302).redirect("/docs");
  });

  return fastify;
}
