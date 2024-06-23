import { db } from "@/config/db";
import type { Context } from "hono";

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
export function getServiceId(c: Context): string | null {
  const header = c.req.header("x-service-id");
  return header ?? null;
}

/**
 * Helper for finding a service by its ID.
 * @param serviceId The ID of the service to find
 * @param mustBeAdmin If true, the service must be an admin service
 */
export async function getService(serviceId: string, opts = { mustBeAdmin: false }) {
  const service = await db.query.services.findFirst({
    where: (fields, { and, eq }) =>
      and(eq(fields.id, serviceId), ...(opts.mustBeAdmin ? [eq(fields.isAdmin, true)] : [])),
  });
  return service ?? null;
}
