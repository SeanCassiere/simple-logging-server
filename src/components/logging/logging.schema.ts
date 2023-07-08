import { z } from "zod";
import { ServiceZodSchema } from "../services/services.schema";

const logCreateInput = {
  action: z.string(),
  environment: z.string().default("production"),
  ip: z.string().nullable().optional(),
  lookupFilterValue: z.string().nullable().optional(),
  data: z.any().optional(),
};
const CreateLogInputSchema = z.object({
  ...logCreateInput,
});
export type CreateLogInput = z.infer<typeof CreateLogInputSchema>;

//
const logGenerated = {
  id: z.string(),
  ...logCreateInput,
  createdAt: z.date(),
  serviceId: z.string(),
};
const LogResponseSchema = z.object({
  ...logGenerated,
});
const LogsResponseSchema = z.array(LogResponseSchema);

//
const LogResponseWithServiceSchema = z.object({
  ...logGenerated,
  service: ServiceZodSchema,
});
const LogsResponseWithServiceSchema = z.array(LogResponseWithServiceSchema);

//
const getLogsQueryParamsInput = {
  lookup: z.string().optional(),
  environment: z.string().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  page_size: z.coerce.number().min(1).optional().default(50),
};

const GetLogsQueryParamsSchema = z.object({
  ...getLogsQueryParamsInput,
});
export type TGetLogsQueryParamsInput = z.infer<typeof GetLogsQueryParamsSchema>;

//
const GetLogsForAdminQueryParamsSchema = z.object({
  ...getLogsQueryParamsInput,
  serviceId: z.string().optional(),
});
export type TGetLogsForAdminQueryParams = z.infer<typeof GetLogsForAdminQueryParamsSchema>;

export const logModels = {
  CreateLogDTO: CreateLogInputSchema,
  LogListQueryDTO: GetLogsQueryParamsSchema,
  LogListAdminQueryDTO: GetLogsForAdminQueryParamsSchema,
  LogResponse: LogResponseSchema,
  LogListResponse: LogsResponseSchema,
  LogWithServiceResponse: LogResponseWithServiceSchema,
  LogListWithServiceResponse: LogsResponseWithServiceSchema,
};
