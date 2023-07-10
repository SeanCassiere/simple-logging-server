import { z } from "zod";

const ServiceIdRouteParamSchema = z.object({
  ServiceId: z.string(),
});

export type ServiceIdRouteParamInput = z.infer<typeof ServiceIdRouteParamSchema>;

//
const ServiceResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  isActive: z.boolean(),
  isPersisted: z.boolean(),
  isAdmin: z.boolean(),
  createdAt: z.date(),
});

const ServiceListResponseSchema = z.array(ServiceResponseSchema);

export const serviceModels = {
  //
  ServiceIdPathParameter: ServiceIdRouteParamSchema,
  //
  ServiceResponse: ServiceResponseSchema,
  ServiceListResponse: ServiceListResponseSchema,
};
