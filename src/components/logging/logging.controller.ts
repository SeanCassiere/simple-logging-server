import { FastifyReply, FastifyRequest } from "fastify";

import { cleanLogsForAll, createLog, getLogs } from "./logging.service";
import { TGetLogsSearchParamsInput, type CreateLogInput } from "./logging.schema";

import { findActiveService } from "../services/services.service";

import { env } from "../../config/env";
import { TXAppServiceIdHeaderSchema } from "../common.schema";
import { ENDPOINT_MESSAGES } from "../../utils/messages";

export async function createLogForServiceHandler(
  request: FastifyRequest<{
    Headers: TXAppServiceIdHeaderSchema;
    Body: CreateLogInput;
  }>,
  reply: FastifyReply,
) {
  if (env.FREEZE_DB_WRITES) {
    return reply.code(503).send({ success: false, message: "Database writes are currently frozen" });
  }

  const serviceId = request.headers["x-app-service-id"];

  const service = await findActiveService({ serviceId: serviceId });
  if (!service) {
    reply.code(404).send({ success: false, message: "Service ID invalid or inactive" });
    return;
  }

  try {
    const log = await createLog({ ...request.body, serviceId, isPersisted: service.isPersisted });
    reply.code(201).send(log);
  } catch (error) {
    reply.code(500).send({ success: false, message: `error creating log for service ${serviceId}` });
  }
}

export async function getLogsForServiceHandler(
  request: FastifyRequest<{
    Headers: TXAppServiceIdHeaderSchema;
    Querystring: TGetLogsSearchParamsInput;
  }>,
  reply: FastifyReply,
) {
  const serviceId = request.headers["x-app-service-id"];

  try {
    const logs = await getLogs({
      serviceId,
      lookupValue: request.query.lookup,
      sortDirection: request.query.sort && request.query.sort.toLowerCase() === "desc" ? "desc" : "asc",
      environment: request.query.environment,
      limit: request.query.page_size,
      skip: (request.query.page - 1) * request.query.page_size,
      level: request.query.level,
    });
    reply.code(200).send(logs);
  } catch (error) {
    reply.code(500).send({ success: false, message: `something went wrong finding logs for ${serviceId}`, errors: [] });
  }
}

export async function cleanLogsForAllHandler(
  request: FastifyRequest<{
    Headers: TXAppServiceIdHeaderSchema;
  }>,
  reply: FastifyReply,
) {
  if (env.FREEZE_DB_WRITES) {
    return reply.code(503).send({ success: false, message: "Database writes are currently frozen", errors: [] });
  }

  const client = await findActiveService({ serviceId: request.headers["x-app-service-id"] ?? "" });

  if (!client) {
    reply.statusCode = 403;
    reply.send({ success: false, message: ENDPOINT_MESSAGES.ServiceNotFound });
    return;
  }

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
      level: "info",
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
