import { FastifyInstance } from "fastify";

import { getAllServicesForAdminUser } from "./services.controller";

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
          503: $ref("SuccessResponse"),
        },
      },
    },
    getAllServicesForAdminUser
  );
}
