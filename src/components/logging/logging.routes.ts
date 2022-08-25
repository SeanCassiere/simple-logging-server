import { FastifyInstance } from "fastify";
import { createLogRecord } from "./logging.controller";

export async function loggingRoutes(server: FastifyInstance) {
  server.post("/", createLogRecord);
}
