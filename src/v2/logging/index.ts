import { Hono } from "hono";

import type { ServerContext } from "@/types/hono";
import { getQueryParams } from "@/utils/query-string";
import { getLogsFiltersSchema } from "./schemas";
import { db } from "@/config/db";

const app = new Hono<ServerContext>();

/**
 * Get all log entries
 */
app.get("/", async (c) => {
  const searchQuery = getQueryParams(c.req.url);
  const search = getLogsFiltersSchema.parse(searchQuery);

  const logLevels = search.level.filter((val) => val !== "all");

  const logs = await db.query.logs.findMany({
    limit: search.page_size,
    offset: search.page_size * (search.page - 1),
    orderBy: (fields, { asc, desc }) => (search.sort === "ASC" ? asc(fields.createdAt) : desc(fields.createdAt)),
    where: (fields, { and, eq, inArray }) =>
      and(
        // ...[eq(fields.serviceId, data.serviceId)],
        ...(search.environment ? [eq(fields.environment, search.environment)] : []),
        ...(search.lookup ? [eq(fields.lookupFilterValue, search.lookup)] : []),
        ...(logLevels.length > 0 ? [inArray(fields.level, logLevels)] : []),
      ),
  });

  return c.json(logs);
});

/**
 * Create a log entry
 */
app.post("/", async (c) => {});

export default app;
