import { FastifyInstance } from "fastify";

import { cleanLogsForAllHandler, createLogForServiceHandler, getLogsForServiceHandler } from "./logging.controller";

import { $ref } from "../../config/fastify-zod";
import { ENDPOINT_MESSAGES } from "../../utils/messages";
import { env } from "../../config/env";

export async function logRoutes(server: FastifyInstance) {
  server.get(
    "",
    {
      schema: {
        tags: ["Logs"],
        operationId: "GetLogsForService",
        querystring: $ref("GetLogsSearchParamDTO"),
        response: {
          200: {
            $ref: $ref("LogListResponse").$ref,
            description: "List of logs for the service",
          },
          500: {
            $ref: $ref("SuccessResponse").$ref,
            description: ENDPOINT_MESSAGES.ServerError,
          },
        },
      },
    },
    getLogsForServiceHandler
  );

  server.post(
    "",
    {
      schema: {
        tags: ["Logs"],
        operationId: "CreateLogForService",
        body: $ref("CreateLogDTO"),
        response: {
          201: {
            $ref: $ref("LogResponse").$ref,
            description: "Log created",
          },
          404: {
            $ref: $ref("SuccessResponse").$ref,
            description: ENDPOINT_MESSAGES.ServiceNotFound,
          },
          500: {
            $ref: $ref("SuccessResponse").$ref,
            description: ENDPOINT_MESSAGES.ServerError,
          },
        },
      },
    },
    createLogForServiceHandler
  );

  server.delete(
    "/purge",
    {
      schema: {
        tags: ["Logs"],
        operationId: `PurgeLogsForAllServices-Admin`,
        description: `Purge the logs for all services that do NOT have their logs persisted. This will delete logs that are older than ${env.DEFAULT_NUM_OF_MONTHS_TO_DELETE} months.\nOnly available to admins`,
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
          500: {
            $ref: $ref("SuccessResponse").$ref,
            description: ENDPOINT_MESSAGES.ServerError,
          },
        },
      },
    },
    cleanLogsForAllHandler
  );
}
