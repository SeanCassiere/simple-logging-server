import { FastifyReply, FastifyRequest } from "fastify";

import { TXAppClientIdHeaderSchema } from "../common.schema";
import { findActiveService } from "../services/services.service";
import { createLog, cleanLogsForAll } from "./logging.service";

export async function cleanLogsForAllHandler(
  request: FastifyRequest<{
    Headers: TXAppClientIdHeaderSchema;
  }>,
  reply: FastifyReply
) {
  const xAppClientId = request.headers["x-app-client-id"];

  const client = await findActiveService({ serviceId: xAppClientId, isAdmin: true });
  if (!client) {
    reply.statusCode = 403;
    reply.send({ success: false, message: `${xAppClientId} - client does not exist or does not have admin rights` });
    return;
  }

  try {
    // clean the logs
    await cleanLogsForAll();

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
    reply.send({ success: true, message: "Successfully cleaned logs for 6m" });
    return;
  } catch (error) {
    reply.statusCode = 500;
    reply.send({ success: false, message: "There was an error on the server" });
    return;
  }
}
