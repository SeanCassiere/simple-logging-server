import { z } from "zod";

/**
 * Fields
 */
const f = {
  action: z.string(),
  environment: z.string(),
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
  levelWithAll: z
    .preprocess(
      (val) => {
        if (typeof val === "string") return [val];
        return ["all"];
      },
      z.array(z.enum(["all", "info", "warn", "error", "fatal"])),
    )
    .default(["all"]),
};

export const createLogSchema = z.object({
  action: f.action,
  environment: f.environment.default("production"),
  ip: f.ip,
  lookupFilterValue: f.lookupFilterValue,
  data: f.data,
  level: f.level,
});

export const getLogsFiltersSchema = z.object({
  lookup: f.lookupFilterValue.optional(),
  environment: f.environment.optional(),
  sort: z.enum(["ASC", "DESC"]).default("DESC"),
  page: z.coerce.number().min(1).default(1),
  page_size: z.coerce.number().min(1).default(50),
  level: f.levelWithAll,
});

const logOutput = z.object({
  id: z.string(),
  action: z.string(),
  environment: z.string(),
  ip: z.string().nullable(),
  level: z.string(),
  data: f.data,
  lookupFilterValue: z.string().nullable(),
  createdAt: z.string(),
});

export const getLogsOutputSchema = z.array(logOutput);
export const createLogOutputSchema = logOutput;
