import { z } from "zod";

const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

const XAppClientIdHeaderSchema = z.object({
  "x-app-client-id": z.string(),
});

export type TXAppClientIdHeaderSchema = z.infer<typeof XAppClientIdHeaderSchema>;

export const commonModels = {
  XAppClientIdHeader: XAppClientIdHeaderSchema,
  SuccessResponse: SuccessResponseSchema,
};
