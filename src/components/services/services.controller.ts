import { FastifyReply, FastifyRequest } from "fastify";

import { createService, disableService, findAllServices, findServiceById } from "./services.service";
import type { CreateServiceInput, ServiceIdRouteParamInput } from "./services.schema";

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

export async function disableServiceForAdmin(
  request: FastifyRequest<{ Headers: TXAppServiceIdHeaderSchema; Params: ServiceIdRouteParamInput }>,
  reply: FastifyReply,
) {
  try {
    const xAppServiceId = request.headers["x-app-service-id"];

    if (xAppServiceId === request.params.ServiceId) {
      return reply.code(400).send({
        success: false,
        message: "You cannot disable the service you are using.",
      });
    }

    await disableService({ serviceId: request.params.ServiceId });

    reply.code(200).send({ success: true, message: ENDPOINT_MESSAGES.ServiceDisabled });
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
