import { FastifyInstance } from "fastify";

import { $ref as $refService } from "./services.schema";
import { $ref as $refLog } from "../logging/logging.schema";
import { createServiceLogHandler, getServiceLogsHandler } from "./services.controller";

export async function serviceRoutes(server: FastifyInstance) {
  server.get(
    "/:ServiceId/logs",
    {
      schema: {
        tags: ["Services"],
        operationId: "GetLogsForService",
        params: $refService("ServiceIdRouteParamSchema"),
        querystring: $refService("GetServiceLogsQueryParamsSchema"),
        response: {
          200: $refLog("LogsResponseSchema"),
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
        body: $refLog("CreateLogInputSchema"),
        params: $refService("ServiceIdRouteParamSchema"),
        response: {
          201: $refLog("LogResponseSchema"),
        },
      },
    },
    createServiceLogHandler
  );
}
