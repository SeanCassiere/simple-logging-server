import { FastifyInstance } from "fastify";

import { $ref } from "../../config/fastify-zod";
import { cleanLogsForAllHandler } from "./logging.controller";

export async function logRoutes(server: FastifyInstance) {
  server.get(
    `/clean`,
    {
      schema: {
        tags: ["Logs"],
        operationId: `CleanLogsForAll`,
        description: "Clean all logs for all services that are not persisted",
        headers: $ref("XAppServiceIdHeader"),
        response: {
          200: $ref("SuccessResponse"),
          403: $ref("SuccessResponse"),
          500: $ref("SuccessResponse"),
        },
      },
    },
    cleanLogsForAllHandler
  );
}
