import { FastifyInstance } from "fastify";

import { getAllServicesForAdmin, getServiceByIdForAdmin } from "./services.controller";
import { serviceIdMiddleware } from "../common.middleware";

import { $ref } from "../../config/fastify-zod";
import { ENDPOINT_MESSAGES } from "../../utils/messages";

export async function serviceRoutes(server: FastifyInstance) {
  server.get(
    "",
    {
      preHandler: [serviceIdMiddleware({ checkAdmin: true })],
      schema: {
        tags: ["Services", "Admin"],
        operationId: "GetAllServices-Admin",
        description: "Get the details for all the services.\nOnly available to admins",
        response: {
          200: {
            $ref: $ref("ServiceListResponse").$ref,
            description: "All services",
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
    getAllServicesForAdmin
  );

  server.get(
    "/:ServiceId",
    {
      preHandler: [serviceIdMiddleware({ checkAdmin: true })],
      schema: {
        tags: ["Services", "Admin"],
        operationId: "GetServiceById-Admin",
        description: "Get the details of a service by its ID.\nOnly available to admins",
        params: $ref("ServiceIdPathParameter"),
        response: {
          200: {
            $ref: $ref("ServiceResponse").$ref,
            description: "Service details",
          },
          401: {
            $ref: $ref("SuccessResponse").$ref,
            description: ENDPOINT_MESSAGES.UnAuthorized,
          },
          403: {
            $ref: $ref("SuccessResponse").$ref,
            description: ENDPOINT_MESSAGES.ForbiddenMustBeAdmin,
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
    getServiceByIdForAdmin
  );
}
