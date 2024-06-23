import { Hono } from "hono";

import { parseSearchParams, serviceValidation } from "@/utils/server-helpers";
import { db } from "@/config/db";
import { ENDPOINT_MESSAGES } from "@/utils/messages";
import type { ServerContext } from "@/types/hono";

import { createLogOutputSchema, createLogSchema, getLogsFiltersSchema, getLogsOutputSchema } from "./schemas";
import { env } from "@/config/env";
import { logs as logsTable } from "@/config/db/schema";
import { createDbId } from "@/utils/db";

const app = new Hono<ServerContext>();

/**
 * @public
 * Get all log entries
 */
app.get("/", serviceValidation, async (c) => {
  const service = c.var.service!;
  const serviceId = service.id;

  const searchQuery = parseSearchParams(c.req.url);
  const searchResult = getLogsFiltersSchema.safeParse(searchQuery);

  if (!searchResult.success) {
    c.status(400);
    return c.json({ success: false, message: searchResult.error.message });
  }

  const search = searchResult.data;

  const logLevels = search.level.filter((val) => val !== "all");

  const logs = await db.query.logs.findMany({
    limit: search.page_size,
    offset: search.page_size * (search.page - 1),
    orderBy: (fields, { asc, desc }) => (search.sort === "ASC" ? asc(fields.createdAt) : desc(fields.createdAt)),
    where: (fields, { and, eq, inArray }) =>
      and(
        ...[eq(fields.serviceId, serviceId)],
        ...(search.environment ? [eq(fields.environment, search.environment)] : []),
        ...(search.lookup ? [eq(fields.lookupFilterValue, search.lookup)] : []),
        ...(logLevels.length > 0 ? [inArray(fields.level, logLevels)] : []),
      ),
  });

  return c.json(getLogsOutputSchema.parse(logs));
});

/**
 * @public
 * Create a log entry
 */
app.post("/", serviceValidation, async (c) => {
  const service = c.var.service!;
  const serviceId = service.id;

  if (env.FREEZE_DB_WRITES) {
    c.status(503);
    return c.json({ success: false, message: ENDPOINT_MESSAGES.DBWritesFrozen });
  }

  const body = await c.req.json();
  const bodyResult = createLogSchema.safeParse(body);

  if (!bodyResult.success) {
    c.status(400);
    return c.json({ success: false, message: bodyResult.error.message });
  }

  const input = bodyResult.data;

  const logId = createDbId("log");
  const log = await db
    .insert(logsTable)
    .values({
      id: logId,
      serviceId,
      action: input.action,
      environment: input.environment,
      ip: input.ip,
      data: input.data || {},
      isPersisted: service.isPersisted,
      lookupFilterValue: input.lookupFilterValue,
      level: input.level,
    })
    .returning({
      id: logsTable.id,
      action: logsTable.id,
      environment: logsTable.environment,
      ip: logsTable.ip,
      lookupFilterValue: logsTable.lookupFilterValue,
      data: logsTable.data,
      level: logsTable.level,
      createdAt: logsTable.createdAt,
    })
    .execute();

  c.status(201);
  return c.json(createLogOutputSchema.parse(log[0]));
});

export default app;
