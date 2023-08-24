import { FastifyReply, FastifyRequest } from "fastify";

import { createService, findAllServices, findServiceById } from "./services.service";
import { type CreateServiceInput, type ServiceIdRouteParamInput } from "./services.schema";

import { type TXAppServiceIdHeaderSchema } from "../common.schema";
import { ENDPOINT_MESSAGES } from "../../utils/messages";

export async function createServiceForAdmin(
  request: FastifyRequest<{ Headers: TXAppServiceIdHeaderSchema; Body: CreateServiceInput }>,
  reply: FastifyReply,
) {
  try {
    const service = await createService(request.body);

    reply.code(201).send(service);
  } catch (error) {
    reply.code(500).send({ success: false, message: ENDPOINT_MESSAGES.ServerError });
  }
}

export async function getAllServicesForAdmin(
  _: FastifyRequest<{ Headers: TXAppServiceIdHeaderSchema }>,
  reply: FastifyReply,
) {
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
  reply: FastifyReply,
) {
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
