import { Hono } from "hono";

import { adminServiceValidation, parseSearchParams } from "@/utils/server-helpers";
import { db } from "@/config/db";
import type { ServerContext } from "@/types/hono";

import { getServiceFiltersSchema, getServicesOutputSchema } from "./schemas";

const app = new Hono<ServerContext>();

/**
 * @private
 * Get all services, only accessible by admins
 */
app.get("/", adminServiceValidation, async (c) => {
  const searchQuery = parseSearchParams(c.req.url);
  const searchResult = getServiceFiltersSchema.safeParse(searchQuery);

  if (!searchResult.success) {
    c.status(400);
    return c.json({ success: false, message: searchResult.error.message });
  }

  const search = searchResult.data;

  const services = await db.query.services.findMany({
    limit: search.page_size,
    offset: search.page_size * (search.page - 1),
    orderBy: (fields, { desc }) => desc(fields.createdAt),
  });

  return c.json(getServicesOutputSchema.parse(services));
});

export default app;
