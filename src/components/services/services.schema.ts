import { z } from "zod";

const ServiceIdRouteParamSchema = z.object({
  ServiceId: z.string(),
});

export type ServiceIdRouteParamInput = z.infer<typeof ServiceIdRouteParamSchema>;

export const serviceModels = {
  ServiceIdParameter: ServiceIdRouteParamSchema,
};
