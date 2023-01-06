import { z } from "zod";

const logCreateInput = {
  action: z.string(),
  environment: z.string().default("production"),
  ip: z.string().nullable().optional(),
  lookupFilterValue: z.string().nullable().optional(),
  data: z.any().nullable().optional(),
};

const logGenerated = {
  id: z.string(),
  ...logCreateInput,
  createdAt: z.date(),
  serviceId: z.string(),
};

const CreateLogInputSchema = z.object({
  ...logCreateInput,
});

const LogResponseSchema = z.object({
  ...logGenerated,
});

const getLogsQueryParamsInput = {
  lookup: z.string().optional(),
  limit: z.string().optional(),
  environment: z.string().optional(),
  sort: z.string().optional(),
};

const GetLogsQueryParamsSchema = z.object({
  ...getLogsQueryParamsInput,
});

const GetLogsForAdminQueryParamsSchema = z.object({
  ...getLogsQueryParamsInput,
  serviceId: z.string().optional(),
});

const LogsResponseSchema = z.array(LogResponseSchema);

export type CreateLogInput = z.infer<typeof CreateLogInputSchema>;

export const logModels = {
  CreateLogDTO: CreateLogInputSchema,
  LogResponse: LogResponseSchema,
  LogListResponse: LogsResponseSchema,
  LogListQueryDTO: GetLogsQueryParamsSchema,
  LogListAdminQueryDTO: GetLogsForAdminQueryParamsSchema,
};
