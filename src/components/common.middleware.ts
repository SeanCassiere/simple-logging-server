import type { FastifyReply, FastifyRequest, DoneFuncWithErrOrRes } from "fastify";

import { findActiveService } from "./services/services.service";

export function serviceIdMiddleware(opts?: { checkAdmin?: boolean }) {
  const { checkAdmin = false } = opts ?? {};

  return async function (request: FastifyRequest<{ Headers: any }>, reply: FastifyReply, done: DoneFuncWithErrOrRes) {
    const xAppServiceId = request.headers["x-app-service-id"];

    if (!xAppServiceId || typeof xAppServiceId !== "string") {
      reply.code(401).send({ success: false, message: `X-APP-SERVICE-ID header was not passed.` });
      return done(new Error("X-APP-SERVICE-ID header was not passed."));
    }
    console.log("xAppServiceId", xAppServiceId);
    const client = await findActiveService({ serviceId: xAppServiceId, ...(checkAdmin ? { isAdmin: true } : {}) });
    console.log("client", client);
    if (!client) {
      reply.code(403).send({
        success: false,
        message: `${xAppServiceId} - service does not exist or does not have necessary rights`,
      });
      return done(new Error("Client does not exist or does not have necessary rights"));
    }

    return done();
  };
}
