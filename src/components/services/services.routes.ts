import { FastifyInstance } from "fastify";

import { $ref } from "../../config/fastify-zod";
import { getServiceLogsHandler } from "./services.controller";

export async function serviceRoutes(server: FastifyInstance) {
  server.get(
    "/:ServiceId/log",
    {
      schema: {
        tags: ["Services"],
        operationId: "GetLogsForService",
        params: $ref("ServiceIdParameter"),
        querystring: $ref("LogListQueryDTO"),
        response: {
          200: $ref("LogListResponse"),
        },
      },
    },
    getServiceLogsHandler
  );
}
