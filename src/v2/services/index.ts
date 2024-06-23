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
  getServiceOutputSchema,
  getServicesOutputSchema,
} from "./schemas";
import { ENDPOINT_MESSAGES } from "@/utils/messages";
import { eq } from "drizzle-orm";

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

/**
 * @private
 * Get a service by its ID, only accessible by admins
 */
app.get("/:service_id", adminServiceValidation, async (c) => {
  const serviceId = c.req.param("service_id");

  const service = await db.query.services.findFirst({
    where: (fields, { and, eq }) => and(eq(fields.id, serviceId), eq(fields.isActive, true)),
  });

  if (!service) {
    c.status(404);
    return c.json({ success: false, message: ENDPOINT_MESSAGES.ServiceNotFound });
  }

  return c.json(getServiceOutputSchema.parse(service));
});

app.delete("/:service_id", adminServiceValidation, async (c) => {
  const reqServiceId = c.var.service!.id;
  const serviceId = c.req.param("service_id");

  if (reqServiceId.trim() === serviceId.trim()) {
    c.status(400);
    return c.json({ success: false, message: ENDPOINT_MESSAGES.ServiceCannotDisableSelf });
  }

  await db.update(servicesTable).set({ isActive: false }).where(eq(servicesTable.id, serviceId)).execute();

  c.status(200);
  return c.json({ success: true, message: ENDPOINT_MESSAGES.ServiceDisabled });
});

export default app;
