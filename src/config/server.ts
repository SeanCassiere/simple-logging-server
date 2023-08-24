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

  const fastify = Fastify();

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
    swaggerUiOptions: {
      routePrefix: "/docs",
      staticCSP: true,
      uiConfig: {
        docExpansion: "list",
        displayRequestDuration: true,
        displayOperationId: true,
      },
      theme: {
        title: "Simple Logging Server API Documentation",
      },
    },
    swaggerOptions: {
      stripBasePath: true,
      openapi: {
        openapi: "3.0.0",
        servers: [{ url: env.SERVER_URI + "/api/v2", description: `Base URL (${env.NODE_ENV})` }],
        info: {
          title: "Simple Logging Server API",
          version: packageVersion,
          description: `This is a simple API for logging messages. It is intended to be a basic interface for logging messages according to an allowed list of clients.
### Usage
\`\`\`sh\n\n  Base URL: ${env.SERVER_URI}/api/v2\n\n  HTTP headers:\n    X-APP-SERVICE-ID: [ServiceID]\n\n\`\`\`
All functions on this server is tied to your \`ServiceID\`. To get your own \`ServiceID\`, DM me on [X/Twitter](https://twitter.com/SeanCassiere) or send me an email using the contact details below.`,
          license: {
            name: "MIT",
            url: "https://github.com/SeanCassiere/simple-logging-server/blob/master/LICENSE.md",
          },
          contact: {
            email: "admin@pingstash.com",
          },
        },
        tags: [
          { name: "Logs", description: "Routes that interact with the `Log` entity." },
          { name: "Services", description: "All routes that interact with the `Service` entity." },
          {
            name: "Admin",
            description:
              "Routes are exclusively available to services that require the `Service` to have `admin` privileges.",
          },
        ],
        externalDocs: {
          description: "GitHub Repository",
          url: "https://github.com/SeanCassiere/simple-logging-server",
        },
        components: {
          securitySchemes: {
            ServiceIdHeaderAuth: {
              type: "apiKey",
              in: "header",
              name: "X-APP-SERVICE-ID",
            },
          },
        },
      },
      hideUntagged: true,
    },
  });

  fastify.register(logRoutes, { prefix: "/api/v2/log" });
  fastify.register(serviceRoutes, { prefix: "/api/v2/service" });

  fastify.get("/swagger", (_, reply) => {
    reply.code(302).redirect("/docs");
  });
  fastify.get("/", (_, reply) => {
    reply.code(302).redirect("/docs");
  });

  return fastify;
}
