import { Hono } from "hono";
import { and, eq, lt } from "drizzle-orm";

import { db } from "@/config/db";
import { env } from "@/config/env";
import { logs as logsTable } from "@/config/db/schema";
import { parseSearchParams, serviceValidation } from "@/utils/server-helpers";
import { ENDPOINT_MESSAGES } from "@/utils/messages";
import { createDbId } from "@/utils/db";
import type { ServerContext } from "@/types/hono";

import { createLogOutputSchema, createLogSchema, getLogsFiltersSchema, getLogsOutputSchema } from "./schemas";

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

/**
 * @public
 * Cleans log for a service for a specific number of months
 */
app.delete("/purge", serviceValidation, async (c) => {
  if (env.FREEZE_DB_WRITES) {
    c.status(503);
    return c.json({ success: false, message: ENDPOINT_MESSAGES.DBWritesFrozen });
  }

  const service = c.var.service!;

  const countMonths = Number(env.DEFAULT_NUM_OF_MONTHS_TO_DELETE);

  const ip = c.req.header("x-forwarded-for") ?? null;

  const date = new Date();
  date.setMonth(date.getMonth() - countMonths);

  await db
    .delete(logsTable)
    .where(and(eq(logsTable.isPersisted, false), lt(logsTable.createdAt, date.toISOString())))
    .execute();

  const logId = createDbId("log");
  await db
    .insert(logsTable)
    .values({
      id: logId,
      serviceId: service.id,
      isPersisted: true,
      action: "app-admin-clean-service-logs",
      ip,
      environment: "production",
      lookupFilterValue: "app-admin-action",
      data: { client: service.name, ip },
      level: "info",
    })
    .execute();

  return c.json({ success: true, message: `Successfully cleaned logs for the last ${countMonths} months` });
});

export default app;
