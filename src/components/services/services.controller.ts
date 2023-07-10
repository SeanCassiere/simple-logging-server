import { FastifyReply, FastifyRequest } from "fastify";

import { TGetLogsQueryParamsInput } from "../logging/logging.schema";
import { getLogs } from "../logging/logging.service";
import { ServiceIdRouteParamInput } from "./services.schema";

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
      sortDirection: request.query.sort && request.query.sort.toLowerCase() === "desc" ? "desc" : "asc",
      environment: request.query.environment,
      includeService: false,
      limit: request.query.page_size,
      skip: (request.query.page - 1) * request.query.page_size,
    });
    reply.code(200).send(logs);
  } catch (error) {
    reply.code(500).send({ message: `something went wrong finding logs for ${serviceId}`, errors: [] });
  }
}
