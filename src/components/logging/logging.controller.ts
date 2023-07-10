import { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../../config/env";

import { createLog, cleanLogsForAll, getLogs } from "./logging.service";
import { TGetLogsSearchParamsInput, type CreateLogInput } from "./logging.schema";

import { findActiveService } from "../services/services.service";

import { TXAppServiceIdHeaderSchema } from "../common.schema";
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

export async function createLogForServiceHandler(
  request: FastifyRequest<{
    Body: CreateLogInput;
  }>,
  reply: FastifyReply
) {
  if (env.FREEZE_DB_WRITES) {
    return reply.code(503).send({ message: "Database writes are currently frozen", errors: [] });
  }

  const serviceId = request.body.serviceId;

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

export async function getLogsForServiceHandler(
  request: FastifyRequest<{
    Querystring: TGetLogsSearchParamsInput;
  }>,
  reply: FastifyReply
) {
  const serviceId = request.query.service_id;

  try {
    const logs = await getLogs({
      serviceId,
      lookupValue: request.query.lookup,
      sortDirection: request.query.sort && request.query.sort.toLowerCase() === "desc" ? "desc" : "asc",
      environment: request.query.environment,
      limit: request.query.page_size,
      skip: (request.query.page - 1) * request.query.page_size,
    });
    reply.code(200).send(logs);
  } catch (error) {
    reply.code(500).send({ message: `something went wrong finding logs for ${serviceId}`, errors: [] });
  }
}

export async function cleanLogsForAllHandler(
  request: FastifyRequest<{
    Headers: TXAppServiceIdHeaderSchema;
  }>,
  reply: FastifyReply
) {
  if (env.FREEZE_DB_WRITES) {
    return reply.code(503).send({ message: "Database writes are currently frozen", errors: [] });
  }

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
