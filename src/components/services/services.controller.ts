import { FastifyReply, FastifyRequest } from "fastify";

import { createLog, getLogs } from "../logging/logging.service";
import { type TGetLogsSearchParamsInput } from "../logging/logging.schema";

import { findActiveService } from "./services.service";
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
    reply.statusCode = 403;
    reply.send({ success: false, message: `${xAppClientId} - client does not exist or does not have admin rights` });
    throw new Error("Client does not exist or does not have admin rights");
  }

  return client;
};

export async function getLogsForServiceAdminHandler(
  request: FastifyRequest<{
    Headers: TXAppServiceIdHeaderSchema;
    Params: ServiceIdRouteParamInput;
    Querystring: TGetLogsSearchParamsInput;
  }>,
  reply: FastifyReply
) {
  const client = await validateHeaderServiceIdIsAdmin(request, reply);

  const query = request.query;
  const serviceId = request.params.ServiceId;

  const ip = request.ip;
  // make a persisted log of this view action
  try {
    await createLog({
      serviceId: client.id,
      isPersisted: true,
      action: "app-admin-view-service-logs",
      ip,
      environment: "production",
      lookupFilterValue: "app-admin-action",
      data: { client: client.name, ip },
    });

    const logs = await getLogs({
      serviceId: serviceId,
      environment: query?.environment,
      lookupValue: query?.lookup,
      sortDirection: query?.sort?.toLowerCase() === "desc" ? "desc" : "asc",
      limit: request.query.page_size,
      skip: (request.query.page - 1) * request.query.page_size,
    });

    reply.statusCode = 200;
    reply.send(logs);
    return;
  } catch (error) {
    reply.statusCode = 500;
    reply.send({ success: false, message: ENDPOINT_MESSAGES.ServerError });
    return;
  }
}
