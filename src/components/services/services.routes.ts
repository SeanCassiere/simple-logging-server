import { FastifyInstance } from "fastify";

import { $ref } from "../../config/fastify-zod";

import { getLogsForServiceAdminHandler } from "./services.controller";

import { ENDPOINT_MESSAGES } from "../../utils/messages";

export async function serviceRoutes(server: FastifyInstance) {
  server.get(
    "/:ServiceId/log",
    {
      schema: {
        tags: ["Services"],
        operationId: "GetAllLogs",
        description: "Get all the logs for all service.\nOnly available to admins",
        headers: $ref("XAppServiceIdHeader"),
        params: $ref("ServiceIdPathParameter"),
        querystring: $ref("GetLogsSearchParamDTO"),
        response: {
          200: {
            $ref: $ref("LogListResponse").$ref,
            description: "All logs for the services",
          },
          403: {
            $ref: $ref("SuccessResponse").$ref,
            description: ENDPOINT_MESSAGES.ForbiddenMustBeAdmin,
          },
          503: $ref("SuccessResponse"),
        },
      },
    },
    getLogsForServiceAdminHandler
  );
}
