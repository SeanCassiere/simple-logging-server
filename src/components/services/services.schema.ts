import { z } from "zod";

const commonServiceSchema = z.object({
  name: z.string(),
  isPersisted: z.boolean(),
  isAdmin: z.boolean(),
});

const CreateServiceInputSchema = commonServiceSchema.extend({});
export type CreateServiceInput = z.infer<typeof CreateServiceInputSchema>;

//
const ServiceIdRouteParamSchema = z.object({
  ServiceId: z.string(),
});

export type ServiceIdRouteParamInput = z.infer<typeof ServiceIdRouteParamSchema>;

//
const ServiceResponseSchema = commonServiceSchema.extend({
  id: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

const ServiceListResponseSchema = z.array(ServiceResponseSchema);

export const serviceModels = {
  //
  ServiceIdPathParameter: ServiceIdRouteParamSchema,
  //
  CreateServiceDTO: CreateServiceInputSchema,
  //
  ServiceResponse: ServiceResponseSchema,
  ServiceListResponse: ServiceListResponseSchema,
};
