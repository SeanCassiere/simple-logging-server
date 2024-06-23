import { createFactory } from "hono/factory";
import type { Context } from "hono";

import { db } from "@/config/db";
import { ENDPOINT_MESSAGES } from "./messages";

/**
 * Takes a URL and returns an object with the query string parameters, multiple of the same key will be an array
 */
export function parseSearchParams(url: string): Record<string, string | string[]> {
  const search = new URL(url).searchParams;
  const params: Record<string, string | string[]> = {};
  search.forEach((value, key) => {
    if (params[key]) {
      if (Array.isArray(params[key])) {
        params[key] = [...params[key], value];
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  });
  return params;
}

/**
 * Get the service ID from the request headers
 */
function getServiceId(c: Context): string | null {
  const header = c.req.header("x-app-service-id");
  return header ?? null;
}

/**
 * Helper for finding a service by its ID.
 * @param serviceId The ID of the service to find
 * @param mustBeAdmin If true, the service must be an admin service
 */
async function getService(serviceId: string, opts = { mustBeAdmin: false }) {
  const service = await db.query.services.findFirst({
    where: (fields, { and, eq }) =>
      and(eq(fields.id, serviceId), ...(opts.mustBeAdmin ? [eq(fields.isAdmin, true)] : []), eq(fields.isActive, true)),
  });
  return service ?? null;
}

const factory = createFactory();

/**
 * Middleware to validate that a service ID is provided and that the service exists
 */
export const serviceValidation = factory.createMiddleware(async (c, next) => {
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

  c.set("service", service);
  await next();
});

/**
 * Middleware to validate that a service ID is provided and that the service exists and is an admin service
 */
export const adminServiceValidation = factory.createMiddleware(async (c, next) => {
  const serviceId = getServiceId(c);

  if (!serviceId) {
    c.status(401);
    return c.json({ success: false, message: ENDPOINT_MESSAGES.ServiceIdHeaderNotProvided });
  }

  const service = await getService(serviceId, { mustBeAdmin: true });

  if (!service) {
    c.status(403);
    return c.json({ success: false, message: ENDPOINT_MESSAGES.ServiceDoesNotExistOrDoesNotHaveNecessaryRights });
  }

  c.set("service", service);
  await next();
});
