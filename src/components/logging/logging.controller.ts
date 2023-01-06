import { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../../config/env";

import { TXAppServiceIdHeaderSchema } from "../common.schema";
import { findActiveService } from "../services/services.service";
import { createLog, cleanLogsForAll, getLogs } from "./logging.service";
import { TGetLogsForAdminQueryParams } from "./logging.schema";
import { ENDPOINT_MESSAGES } from "../../utils/messages";

const validateHeaderServiceIdIsAdmin = async (
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

export async function cleanLogsForAllHandler(
  request: FastifyRequest<{
    Headers: TXAppServiceIdHeaderSchema;
  }>,
  reply: FastifyReply
) {
  const client = await validateHeaderServiceIdIsAdmin(request, reply);

  try {
    const numberOfMonthsToRemove = Number(env.DEFAULT_NUM_OF_MONTHS_TO_DELETE);
    // clean the logs
    await cleanLogsForAll({ numberOfMonthsToRemove });

    const ip = request.ip;
    // make a persisted log of this delete action
    await createLog({
      serviceId: client.id,
      isPersisted: true,
      action: "app-admin-clean-service-logs",
      ip,
      environment: "production",
      lookupFilterValue: "app-admin-action",
      data: { client: client.name, ip },
    });

    reply.statusCode = 200;
    reply.send({ success: true, message: `Successfully cleaned logs for the last ${numberOfMonthsToRemove} months` });
    return;
  } catch (error) {
    reply.statusCode = 500;
    reply.send({ success: false, message: ENDPOINT_MESSAGES.ServerError });
    return;
  }
}

export async function getAllLogsForAdminHandler(
  request: FastifyRequest<{
    Headers: TXAppServiceIdHeaderSchema;
    Querystring: TGetLogsForAdminQueryParams;
  }>,
  reply: FastifyReply
) {
  const client = await validateHeaderServiceIdIsAdmin(request, reply);
  const query = request.query;

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
      serviceId: query?.serviceId,
      environment: query?.environment,
      lookupValue: query?.lookup,
      includeService: true,
      limit: query?.limit ? parseInt(query?.limit) : 500,
      sortDirection: query?.sort?.toLowerCase() === "desc" ? "desc" : "asc",
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
