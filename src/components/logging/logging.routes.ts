import { FastifyInstance } from "fastify";

import { cleanLogsForAllHandler, createLogForServiceHandler, getLogsForServiceHandler } from "./logging.controller";
import { serviceIdMiddleware } from "../common.middleware";

import { $ref } from "../../config/fastify-zod";
import { env } from "../../config/env";
import { ENDPOINT_MESSAGES } from "../../utils/messages";

export async function logRoutes(server: FastifyInstance) {
  server.get(
    "",
    {
      preHandler: [serviceIdMiddleware()],
      schema: {
        tags: ["Logs"],
        operationId: "GetLogsForService",
        querystring: $ref("GetLogsSearchParamDTO"),
        response: {
          200: {
            $ref: $ref("LogListResponse").$ref,
            description: "List of logs for the service",
          },
          401: {
            $ref: $ref("SuccessResponse").$ref,
            description: ENDPOINT_MESSAGES.UnAuthorized,
          },
          403: {
            $ref: $ref("SuccessResponse").$ref,
            description: ENDPOINT_MESSAGES.ForbiddenServiceNotAvailable,
          },
          500: {
            $ref: $ref("SuccessResponse").$ref,
            description: ENDPOINT_MESSAGES.ServerError,
          },
        },
        security: [{ ServiceIdHeaderAuth: [] }],
      },
    },
    getLogsForServiceHandler
  );

  server.post(
    "",
    {
      preHandler: [serviceIdMiddleware()],
      schema: {
        tags: ["Logs"],
        operationId: "CreateLogForService",
        body: $ref("CreateLogDTO"),
        response: {
          201: {
            $ref: $ref("LogResponse").$ref,
            description: "Log created",
          },
          401: {
            $ref: $ref("SuccessResponse").$ref,
            description: ENDPOINT_MESSAGES.UnAuthorized,
          },
          403: {
            $ref: $ref("SuccessResponse").$ref,
            description: ENDPOINT_MESSAGES.ForbiddenServiceNotAvailable,
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
        security: [{ ServiceIdHeaderAuth: [] }],
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
