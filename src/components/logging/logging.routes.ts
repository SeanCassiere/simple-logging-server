import { FastifyInstance } from "fastify";

import { ENDPOINT_MESSAGES } from "../../utils/messages";
import { $ref } from "../../config/fastify-zod";
import { createLogForServiceHandler, cleanLogsForAllHandler } from "./logging.controller";

export async function logRoutes(server: FastifyInstance) {
  server.post(
    "",
    {
      schema: {
        tags: ["Logs"],
        operationId: "CreateLogForService",
        body: $ref("CreateLogDTO"),
        response: {
          201: $ref("LogResponse"),
        },
      },
    },
    createLogForServiceHandler
  );

  server.delete(
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
