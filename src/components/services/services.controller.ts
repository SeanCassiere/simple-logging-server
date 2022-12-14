import { FastifyReply, FastifyRequest } from "fastify";

import { CreateLogInput, TGetLogsQueryParamsInput } from "../logging/logging.schema";
import { createLog, getLogs } from "../logging/logging.service";
import { ServiceIdRouteParamInput } from "./services.schema";
import { findActiveService } from "./services.service";

export async function createServiceLogHandler(
  request: FastifyRequest<{
    Body: CreateLogInput;
    Params: ServiceIdRouteParamInput;
  }>,
  reply: FastifyReply
) {
  const serviceId = request.params.ServiceId;

  const service = await findActiveService({ serviceId: serviceId });
  if (!service) {
    reply.code(404).send({ message: "Service ID invalid or inactive", errors: [] });
    return;
  }

  try {
    const log = await createLog({ ...request.body, serviceId, isPersisted: service.isPersisted });
    reply.code(201).send(log);
  } catch (error) {
    reply.code(500).send({ message: `error creating log for service ${serviceId}`, errors: [] });
  }
}

export async function getServiceLogsHandler(
  request: FastifyRequest<{
    Params: ServiceIdRouteParamInput;
    Querystring: TGetLogsQueryParamsInput;
  }>,
  reply: FastifyReply
) {
  const serviceId = request.params.ServiceId;

  try {
    const logs = await getLogs({
      serviceId,
      lookupValue: request.query.lookup,
      limit: request.query.limit ? parseInt(request.query.limit) : undefined,
      sortDirection: request.query.sort && request.query.sort.toLowerCase() === "desc" ? "desc" : "asc",
      environment: request.query.environment,
      includeService: false,
    });
    reply.code(200).send(logs);
  } catch (error) {
    reply.code(500).send({ message: `something went wrong finding logs for ${serviceId}`, errors: [] });
  }
}
