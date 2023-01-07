import { buildJsonSchemas } from "fastify-zod";

import { commonModels } from "../components/common.schema";
import { logModels } from "../components/logging/logging.schema";
import { serviceModels } from "../components/services/services.schema";

export const zodModels = { ...commonModels, ...logModels, ...serviceModels };
const build = buildJsonSchemas(zodModels, { target: "openApi3" });

export const { schemas, $ref } = build;
export default build;
