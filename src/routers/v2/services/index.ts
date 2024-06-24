import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { db } from "@/config/db";
import { services as servicesTable } from "@/config/db/schema";
import { createDbId } from "@/utils/db";
import { ENDPOINT_MESSAGES } from "@/utils/messages";
import {
  createV2ErrResponse,
  v2_serviceValidation,
  adminServiceValidation,
  parseSearchParams,
} from "@/utils/server-helpers";
import type { ServerContext } from "@/types/hono";

import {
  createServiceInputSchema,
  createServiceOutputSchema,
  getServiceFiltersSchema,
  getServiceOutputSchema,
  getServicesOutputSchema,
} from "./schemas";

const app = new Hono<ServerContext>();

/**
 * @private
 * Get all services, only accessible by admins
 */
app.get("/", v2_serviceValidation, adminServiceValidation, async (c) => {
  const searchQuery = parseSearchParams(c.req.url);
  const searchResult = getServiceFiltersSchema.safeParse(searchQuery);

  if (!searchResult.success) {
    throw new HTTPException(400, { res: createV2ErrResponse(searchResult.error.message) });
  }

  const search = searchResult.data;

  try {
    const services = await db.query.services.findMany({
      limit: search.page_size,
      offset: search.page_size * (search.page - 1),
      orderBy: (fields, { desc }) => desc(fields.createdAt),
    });
    return c.json(getServicesOutputSchema.parse(services));
  } catch (error) {
    throw new HTTPException(500, { res: createV2ErrResponse(ENDPOINT_MESSAGES.InternalError) });
  }
});

/**
 * @private
 * Create a new service, only accessible by admins
 */
app.post("/", v2_serviceValidation, adminServiceValidation, async (c) => {
  const body = await c.req.json();
  const bodyResult = createServiceInputSchema.safeParse(body);

  if (!bodyResult.success) {
    throw new HTTPException(400, { res: createV2ErrResponse(bodyResult.error.message) });
  }

  const input = bodyResult.data;

  try {
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
  } catch (error) {
    throw new HTTPException(500, { res: createV2ErrResponse(ENDPOINT_MESSAGES.InternalError) });
  }
});

/**
 * @private
 * Get a service by its ID, only accessible by admins
 */
app.get("/:service_id", v2_serviceValidation, adminServiceValidation, async (c) => {
  const serviceId = c.req.param("service_id");

  try {
    const service = await db.query.services.findFirst({
      where: (fields, { and, eq }) => and(eq(fields.id, serviceId), eq(fields.isActive, true)),
    });

    if (!service) {
      throw new HTTPException(404, { res: createV2ErrResponse(ENDPOINT_MESSAGES.ServiceNotFound) });
    }

    return c.json(getServiceOutputSchema.parse(service));
  } catch (error) {
    throw new HTTPException(500, { res: createV2ErrResponse(ENDPOINT_MESSAGES.InternalError) });
  }
});

/**
 * @private
 * Disable a service, only accessible by admins
 */
app.delete("/:service_id", v2_serviceValidation, adminServiceValidation, async (c) => {
  const reqServiceId = c.var.service!.id;
  const serviceId = c.req.param("service_id");

  if (reqServiceId === serviceId) {
    throw new HTTPException(400, { res: createV2ErrResponse(ENDPOINT_MESSAGES.ServiceCannotDisableSelf) });
  }

  try {
    await db.update(servicesTable).set({ isActive: false }).where(eq(servicesTable.id, serviceId)).execute();

    c.status(200);
    return c.json({ success: true, message: ENDPOINT_MESSAGES.ServiceDisabled });
  } catch (error) {
    throw new HTTPException(500, { res: createV2ErrResponse(ENDPOINT_MESSAGES.InternalError) });
  }
});

/**
 * @private
 * Enable a service, only accessible by admins
 */
app.post("/:service_id/enable", v2_serviceValidation, adminServiceValidation, async (c) => {
  const serviceId = c.req.param("service_id");

  try {
    await db.update(servicesTable).set({ isActive: true }).where(eq(servicesTable.id, serviceId)).execute();

    c.status(200);
    return c.json({ success: true, message: ENDPOINT_MESSAGES.ServiceEnabled });
  } catch (error) {
    throw new HTTPException(500, { res: createV2ErrResponse(ENDPOINT_MESSAGES.InternalError) });
  }
});

export default app;
