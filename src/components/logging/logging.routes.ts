import { FastifyInstance } from "fastify";

import { cleanLogsForAllHandler, createLogForServiceHandler, getLogsForServiceHandler } from "./logging.controller";

import { $ref } from "../../config/fastify-zod";
import { ENDPOINT_MESSAGES } from "../../utils/messages";
import { env } from "../../config/env";
import { serviceIdMiddleware } from "../common.middleware";

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
      preHandler: [serviceIdMiddleware({ checkAdmin: true })],
      schema: {
        tags: ["Logs", "Admin"],
        operationId: `PurgeLogsForAllServices-Admin`,
        description: `Purge the logs for all services that do NOT have their logs persisted. This will delete logs that are older than ${env.DEFAULT_NUM_OF_MONTHS_TO_DELETE} months.\nOnly available to admins`,
        response: {
          200: {
            $ref: $ref("SuccessResponse").$ref,
            description: "Response will have `success: true`.",
          },
          401: {
            $ref: $ref("SuccessResponse").$ref,
            description: ENDPOINT_MESSAGES.UnAuthorized,
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
        security: [{ ServiceIdHeaderAuth: [] }],
      },
    },
    cleanLogsForAllHandler
  );
}
