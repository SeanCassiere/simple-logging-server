import { z } from "zod";

const ServiceIdRouteParamSchema = z.object({
  ServiceId: z.string(),
});

export const ServiceZodSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
});

export type ServiceIdRouteParamInput = z.infer<typeof ServiceIdRouteParamSchema>;

export const serviceModels = {
  ServiceIdParameter: ServiceIdRouteParamSchema,
};
