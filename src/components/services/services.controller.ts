import { FastifyReply, FastifyRequest } from "fastify";

import { findActiveService, findAllServices } from "./services.service";
// import { type ServiceIdRouteParamInput } from "./services.schema";

import { type TXAppServiceIdHeaderSchema } from "../common.schema";
import { ENDPOINT_MESSAGES } from "../../utils/messages";

export const validateHeaderServiceIdIsAdmin = async (
  request: FastifyRequest<{ Headers: TXAppServiceIdHeaderSchema }>,
  reply: FastifyReply
) => {
  const xAppClientId = request.headers["x-app-service-id"];

  const client = await findActiveService({ serviceId: xAppClientId, isAdmin: true });

  if (!client) {
    reply.statusCode = 403;
    reply.send({ success: false, message: `${xAppClientId} - client does not exist or does not have admin rights` });
    throw new Error("Client does not exist or does not have admin rights");
  }

  return client;
};

export async function getAllServicesForAdminUser(
  request: FastifyRequest<{
    Headers: TXAppServiceIdHeaderSchema;
  }>,
  reply: FastifyReply
) {
  await validateHeaderServiceIdIsAdmin(request, reply);

  try {
    const services = await findAllServices();

    reply.statusCode = 200;
    reply.send(services);
    return;
  } catch (error) {
    reply.statusCode = 500;
    reply.send({ success: false, message: ENDPOINT_MESSAGES.ServerError });
    return;
  }
}
