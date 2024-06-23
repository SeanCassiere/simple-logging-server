import { Hono } from "hono";

import { db } from "@/config/db";
import { createDbId } from "@/utils/db";
import { adminServiceValidation, parseSearchParams } from "@/utils/server-helpers";
import { services as servicesTable } from "@/config/db/schema";
import type { ServerContext } from "@/types/hono";

import {
  createServiceInputSchema,
  createServiceOutputSchema,
  getServiceFiltersSchema,
  getServicesOutputSchema,
} from "./schemas";

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

/**
 * @private
 * Create a new service, only accessible by admins
 */
app.post("/", adminServiceValidation, async (c) => {
  const body = await c.req.json();
  const bodyResult = createServiceInputSchema.safeParse(body);

  if (!bodyResult.success) {
    c.status(400);
    return c.json({ success: false, message: bodyResult.error.message });
  }

  const input = bodyResult.data;

  const serviceId = createDbId("service");
  const service = await db
    .insert(servicesTable)
    .values({
      id: serviceId,
      name: input.name,
      isPersisted: input.isPersisted,
      isAdmin: input.isAdmin,
      isActive: true,
    })
    .returning({
      id: servicesTable.id,
      name: servicesTable.name,
      isPersisted: servicesTable.isPersisted,
      isAdmin: servicesTable.isAdmin,
      isActive: servicesTable.isActive,
      createdAt: servicesTable.createdAt,
    })
    .execute();

  return c.json(createServiceOutputSchema.parse(service[0]));
});

export default app;
