import { z } from "zod";

const logCreateInput = {
  action: z.string(),
  environment: z.string().default("production"),
  ip: z.string().nullable().optional(),
  lookupFilterValue: z.string().nullable().optional(),
  data: z.any().optional(),
  serviceId: z.string(),
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
};
const LogResponseSchema = z.object({
  ...logGenerated,
});
const LogsResponseSchema = z.array(LogResponseSchema);

//
const getLogsQueryParamsInput = {
  lookup: z.string().optional(),
  environment: z.string().optional(),
  sort: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  page_size: z.coerce.number().min(1).optional().default(50),
  service_id: z.string(),
};

const GetLogsSearchParamsSchema = z.object({
  ...getLogsQueryParamsInput,
});
export type TGetLogsSearchParamsInput = z.infer<typeof GetLogsSearchParamsSchema>;

export const logModels = {
  GetLogsSearchParamDTO: GetLogsSearchParamsSchema,
  //
  CreateLogDTO: CreateLogInputSchema,
  //
  LogResponse: LogResponseSchema,
  LogListResponse: LogsResponseSchema,
};
