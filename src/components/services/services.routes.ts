import { FastifyInstance } from "fastify";

import { $ref } from "../../config/fastify-zod";
import { createServiceLogHandler, getServiceLogsHandler } from "./services.controller";

export async function serviceRoutes(server: FastifyInstance) {
  server.get(
    "/:ServiceId/logs",
    {
      schema: {
        tags: ["Services"],
        operationId: "GetLogsForService",
        params: $ref("ServiceIdParameter"),
        querystring: $ref("ServiceLogListQueryParams"),
        response: {
          200: $ref("LogListResponse"),
        },
      },
    },
    getServiceLogsHandler
  );
  server.post(
    "/:ServiceId/logs",
    {
      schema: {
        tags: ["Services"],
        operationId: "CreateLogForService",
        body: $ref("CreateLogDTO"),
        params: $ref("ServiceIdParameter"),
        response: {
          201: $ref("LogResponse"),
        },
      },
    },
    createServiceLogHandler
  );
}
