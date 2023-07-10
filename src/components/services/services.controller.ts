import { FastifyReply, FastifyRequest } from "fastify";

import { findActiveService, findAllServices, findServiceById } from "./services.service";
import { type ServiceIdRouteParamInput } from "./services.schema";

import { type TXAppServiceIdHeaderSchema } from "../common.schema";
import { ENDPOINT_MESSAGES } from "../../utils/messages";

export const validateHeaderServiceIdIsAdmin = async (
  request: FastifyRequest<{ Headers: TXAppServiceIdHeaderSchema }>,
  reply: FastifyReply
) => {
  const xAppClientId = request.headers["x-app-service-id"];

  const client = await findActiveService({ serviceId: xAppClientId, isAdmin: true });

  if (!client) {
    reply
      .code(403)
      .send({ success: false, message: `${xAppClientId} - client does not exist or does not have admin rights` });
    throw new Error("Client does not exist or does not have admin rights");
  }

  return client;
};

export async function getAllServicesForAdmin(
  request: FastifyRequest<{
    Headers: TXAppServiceIdHeaderSchema;
  }>,
  reply: FastifyReply
) {
  await validateHeaderServiceIdIsAdmin(request, reply);

  try {
    const services = await findAllServices();

    reply.code(200).send(services);
    return;
  } catch (error) {
    reply.code(500).send({ success: false, message: ENDPOINT_MESSAGES.ServerError });
    return;
  }
}

export async function getServiceByIdForAdmin(
  request: FastifyRequest<{
    Headers: TXAppServiceIdHeaderSchema;
    Params: ServiceIdRouteParamInput;
  }>,
  reply: FastifyReply
) {
  await validateHeaderServiceIdIsAdmin(request, reply);
  const serviceId = request.params.ServiceId;

  try {
    const service = await findServiceById({ serviceId });

    if (!service) {
      return reply.code(404).send({ success: false, message: ENDPOINT_MESSAGES.ServiceNotFound });
    }

    return reply.code(200).send(service);
  } catch (error) {
    return reply.code(500).send({ success: false, message: ENDPOINT_MESSAGES.ServerError });
  }
}
