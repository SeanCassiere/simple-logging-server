import { FastifyInstance } from "fastify";

import { $ref as $refCommon } from "../common.schema";

import { cleanLogsForAllHandler } from "./logging.controller";

export async function logRoutes(server: FastifyInstance) {
  server.get(
    "/clean",
    {
      schema: {
        tags: ["Logs"],
        operationId: "CleanLogsForAll",
        description: "Clean all logs for all services that are not persisted",
        headers: $refCommon("XAppClientIdHeaderSchema"),
        response: {
          200: $refCommon("SuccessResponseSchema"),
          403: $refCommon("SuccessResponseSchema"), //error
          500: $refCommon("SuccessResponseSchema"), //error
        },
      },
    },
    cleanLogsForAllHandler
  );
}
