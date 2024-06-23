import { Hono } from "hono";

import { parseSearchParams, getServiceId, getService } from "@/utils/server-helpers";
import { db } from "@/config/db";
import { ENDPOINT_MESSAGES } from "@/utils/messages";
import type { ServerContext } from "@/types/hono";

import { getLogsFiltersSchema, getLogsOutputSchema } from "./schemas";

const app = new Hono<ServerContext>();

/**
 * Get all log entries
 */
app.get("/", async (c) => {
  const serviceId = getServiceId(c);

  if (!serviceId) {
    c.status(401);
    return c.json({ success: false, message: ENDPOINT_MESSAGES.ServiceIdHeaderNotProvided });
  }

  const service = await getService(serviceId);

  if (!service) {
    c.status(403);
    return c.json({ success: false, message: ENDPOINT_MESSAGES.ServiceDoesNotExistOrDoesNotHaveNecessaryRights });
  }

  const searchQuery = parseSearchParams(c.req.url);
  const search = getLogsFiltersSchema.parse(searchQuery);

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
 * Create a log entry
 */
app.post("/", async (c) => {});

export default app;
