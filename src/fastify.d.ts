import type { FastifyZod } from "fastify-zod";
import { zodModels } from "./config/fastify-zod";

declare module "fastify" {
  interface FastifyInstance {
    readonly zod: FastifyZod<typeof zodModels>;
  }
}
