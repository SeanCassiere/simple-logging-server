import { z } from "zod";

const ServiceIdRouteParamSchema = z.object({
  ServiceId: z.string(),
});

const GetServiceLogsQueryParamsSchema = z.object({
  lookup: z.string().optional(),
  limit: z.string().optional(),
  environment: z.string().optional(),
  sort: z.string().optional(),
});

export type ServiceIdRouteParamInput = z.infer<typeof ServiceIdRouteParamSchema>;
export type GetServiceLogsQueryParamsInput = z.infer<typeof GetServiceLogsQueryParamsSchema>;

export const serviceModels = {
  ServiceIdParameter: ServiceIdRouteParamSchema,
  ServiceLogListQueryParams: GetServiceLogsQueryParamsSchema,
};
