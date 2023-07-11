import { z } from "zod";

const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

const XAppServiceIdHeaderSchema = z.object({
  "x-app-service-id": z.string(),
});

export type TXAppServiceIdHeaderSchema = z.infer<typeof XAppServiceIdHeaderSchema>;

export const commonModels = {
  SuccessResponse: SuccessResponseSchema,
};
