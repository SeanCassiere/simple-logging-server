import { FastifyInstance } from "fastify";

import { ENDPOINT_MESSAGES } from "../../utils/messages";
import { $ref } from "../../config/fastify-zod";
import { cleanLogsForAllHandler } from "./logging.controller";

export async function logRoutes(server: FastifyInstance) {
  server.get(
    "",
    {
      schema: {
        tags: ["Logs"],
        operationId: "GetAllLogs",
        description: "Get all the logs for all service.\nOnly available to admins",
        headers: $ref("XAppServiceIdHeader"),
        querystring: $ref("LogListAdminQueryDTO"),
        response: {
          200: {
            $ref: $ref("LogListResponse").$ref,
            description: "Logs for all service",
          },
          403: {
            $ref: $ref("SuccessResponse").$ref,
            description: ENDPOINT_MESSAGES.ForbiddenMustBeAdmin,
          },
          503: $ref("SuccessResponse"),
        },
      },
    },
    async () => {
      return [];
    }
  );

  server.get(
    `/clean`,
    {
      schema: {
        tags: ["Logs"],
        operationId: `CleanLogsForAll`,
        description: "Clean all logs for all services that are not persisted.\nOnly available to admins",
        headers: $ref("XAppServiceIdHeader"),
        response: {
          200: {
            $ref: $ref("SuccessResponse").$ref,
            description: "Response will have `success: true`.",
          },
          403: {
            $ref: $ref("SuccessResponse").$ref,
            description: ENDPOINT_MESSAGES.ForbiddenMustBeAdmin,
          },
          500: $ref("SuccessResponse"),
        },
      },
    },
    cleanLogsForAllHandler
  );
}
