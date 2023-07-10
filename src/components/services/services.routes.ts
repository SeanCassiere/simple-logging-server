import { FastifyInstance } from "fastify";

import { getAllServicesForAdmin, getServiceByIdForAdmin } from "./services.controller";

import { $ref } from "../../config/fastify-zod";
import { ENDPOINT_MESSAGES } from "../../utils/messages";

export async function serviceRoutes(server: FastifyInstance) {
  server.get(
    "",
    {
      schema: {
        tags: ["Services"],
        operationId: "GetAllServices-Admin",
        description: "Get the details for all the services.\nOnly available to admins",
        headers: $ref("XAppServiceIdHeader"),
        response: {
          200: {
            $ref: $ref("ServiceListResponse").$ref,
            description: "All services",
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
    getAllServicesForAdmin
  );

  server.get(
    "/:ServiceId",
    {
      schema: {
        tags: ["Services"],
        operationId: "GetServiceById-Admin",
        description: "Get the details of a service by its ID.\nOnly available to admins",
        headers: $ref("XAppServiceIdHeader"),
        params: $ref("ServiceIdPathParameter"),
        response: {
          200: {
            $ref: $ref("ServiceResponse").$ref,
            description: "Service details",
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
      },
    },
    getServiceByIdForAdmin
  );
}
