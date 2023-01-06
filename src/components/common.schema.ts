import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

const XAppClientIdHeaderSchema = z.object({
  "x-app-client-id": z.string(),
});

export type TXAppClientIdHeaderSchema = z.infer<typeof XAppClientIdHeaderSchema>;

export const { schemas: commonSchemas, $ref } = buildJsonSchemas(
  {
    SuccessResponseSchema,
    XAppClientIdHeaderSchema,
  },
  {
    $id: "Common",
  }
);
