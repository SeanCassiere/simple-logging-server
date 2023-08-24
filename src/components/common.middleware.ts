import type { FastifyReply, FastifyRequest } from "fastify";

import { findActiveService } from "./services/services.service";

export function serviceIdMiddleware(opts?: { checkAdmin?: boolean }) {
  const { checkAdmin = false } = opts ?? {};

  return async function (request: FastifyRequest<{ Headers: any }>, reply: FastifyReply) {
    const xAppServiceId = request.headers["x-app-service-id"];

    if (!xAppServiceId || typeof xAppServiceId !== "string") {
      reply.code(401).send({ success: false, message: `X-APP-SERVICE-ID header was not passed.` });
      return;
    }

    const client = await findActiveService({ serviceId: xAppServiceId, ...(checkAdmin ? { isAdmin: true } : {}) });

    if (!client) {
      reply.code(403).send({
        success: false,
        message: `${xAppServiceId} - service does not exist or does not have necessary rights`,
      });
      return;
    }

    return;
  };
}
