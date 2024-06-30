import { and, eq, lt } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { db } from "@/config/db/index.mjs";
import { logs as logsTable } from "@/config/db/schema.mjs";
import { env } from "@/config/env.mjs";
import type { ServerContext } from "@/types/hono.mjs";
import { createDbId } from "@/utils/db.mjs";
import { ENDPOINT_MESSAGES } from "@/utils/messages.mjs";
import { createV2ErrResponse, parseSearchParams, v2_serviceValidation } from "@/utils/server-helpers.mjs";

import { createLogOutputSchema, createLogSchema, getLogsFiltersSchema, getLogsOutputSchema } from "./schemas.mjs";

const app = new Hono<ServerContext>();

/**
 * @public
 * Get all log entries
 */
app.get("/", v2_serviceValidation, async (c) => {
  const service = c.var.service!;
  const serviceId = service.id;

  const searchQuery = parseSearchParams(c.req.url);
  const searchResult = getLogsFiltersSchema.safeParse(searchQuery);

  if (!searchResult.success) {
    throw new HTTPException(400, { res: createV2ErrResponse(searchResult.error.message) });
  }

  const search = searchResult.data;

  const logLevels = search.level.filter((val) => val !== "all");

  try {
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
  } catch (error) {
    throw new HTTPException(500, { res: createV2ErrResponse(ENDPOINT_MESSAGES.InternalError) });
  }
});

/**
 * @public
 * Create a log entry
 */
app.post("/", v2_serviceValidation, async (c) => {
  const service = c.var.service!;
  const serviceId = service.id;

  if (env.FREEZE_DB_WRITES) {
    c.status(503);
    return c.json({ success: false, message: ENDPOINT_MESSAGES.DBWritesFrozen });
  }

  const body = await c.req.json();
  const bodyResult = createLogSchema.safeParse(body);

  if (!bodyResult.success) {
    throw new HTTPException(400, { res: createV2ErrResponse(bodyResult.error.message) });
  }

  const input = bodyResult.data;

  try {
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
  } catch (error) {
    throw new HTTPException(500, { res: createV2ErrResponse(ENDPOINT_MESSAGES.InternalError) });
  }
});

/**
 * @public
 * Cleans log for a service for a specific number of months
 */
app.delete("/purge", v2_serviceValidation, async (c) => {
  if (env.FREEZE_DB_WRITES) {
    c.status(503);
    return c.json({ success: false, message: ENDPOINT_MESSAGES.DBWritesFrozen });
  }

  const service = c.var.service!;

  const countMonths = Number(env.DEFAULT_NUM_OF_MONTHS_TO_DELETE);

  const ip = c.req.header("x-forwarded-for") ?? null;

  const date = new Date();
  date.setMonth(date.getMonth() - countMonths);

  try {
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
  } catch (error) {
    throw new HTTPException(500, { res: createV2ErrResponse(ENDPOINT_MESSAGES.InternalError) });
  }
});

export default app;
