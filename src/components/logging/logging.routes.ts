import { FastifyInstance } from "fastify";

import { createLogRecord } from "./createLogRecord";
import { getLogsForService } from "./getLogsForService";

export async function loggingRoutes(server: FastifyInstance) {
  server.post("/", createLogRecord);
  server.get("/services/:serviceId", getLogsForService);
}
