import { z } from "zod";

const logCreateInput = {
  action: z.string(),
  environment: z.string().default("production"),
  ip: z.string().nullable().optional(),
  lookupFilterValue: z.string().nullable().optional(),
  data: z.record(z.string(), z.any()).nullable(),
  level: z
    .preprocess(
      (val) => {
        if (val) return val;
        return val;
      },
      z.enum(["info", "warn", "error", "fatal"]),
    )
    .default("info"),
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
  sort: z.enum(["ASC", "DESC"]).default("DESC").optional(),
  page: z.coerce.number().min(1).optional().default(1),
  page_size: z.coerce.number().min(1).optional().default(50),
  level: z
    .preprocess(
      (val) => {
        if (val) return val;
        return ["all"];
      },
      z.array(z.enum(["all", "info", "warn", "error", "fatal"])),
    )
    .default(["all"])
    .optional(),
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
