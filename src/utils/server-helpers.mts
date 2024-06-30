import { createFactory } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { db } from "@/config/db/index.mjs";
import { env } from "@/config/env.mjs";
import type { ServerContext } from "@/types/hono.mjs";
import type { Context } from "hono";

import { ENDPOINT_MESSAGES } from "./messages.mjs";

/**
 * Takes a string URL and returns an object with the query string parameters, multiple of the same key will be an array
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
function v2_getServiceId(c: Context): string | null {
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

const honoFactory = createFactory<ServerContext>();

/**
 * V2 implementation of the middleware to validate that a service request by the service ID in the "x-app-service-id" header
 */
export const v2_serviceValidation = honoFactory.createMiddleware(async (c, next) => {
  const serviceId = v2_getServiceId(c);

  if (!serviceId) {
    throw new HTTPException(401, {
      res: createV2ErrResponse(ENDPOINT_MESSAGES.ServiceIdHeaderNotProvided),
    });
  }

  const service = await getService(serviceId);

  if (!service) {
    throw new HTTPException(403, {
      res: createV2ErrResponse(ENDPOINT_MESSAGES.ServiceDoesNotExistOrDoesNotHaveNecessaryRights),
    });
  }

  c.set("service", service);
  await next();
});

/**
 * Middleware to validate that a service ID is provided and that the service exists and is an admin service
 */
export const adminServiceValidation = honoFactory.createMiddleware(async (c, next) => {
  const service = c.var.service;

  if (!service || !service.isAdmin) {
    console.log("service", service);
    throw new HTTPException(403, {
      res: createV2ErrResponse(ENDPOINT_MESSAGES.ServiceDoesNotExistOrDoesNotHaveNecessaryRights),
    });
  }

  await next();
});

/**
 * Get the url of the server for the user
 * @returns The URL of the server for the user
 */
export function getUserServerUrl(): string {
  return env.NODE_ENV === "production" ? env.SERVER_URI : `http://localhost:${env.PORT}`;
}

/**
 * Helper function to create a response that matches the V2 error response format
 * @param message Message to include in the response.
 * @param headers Headers to include in the response. Defaults to an empty object with a "Content-Type" header set to "application/json"
 */
export function createV2ErrResponse(message: string, headers: Record<string, string> = {}): Response {
  const responseHeaders = new Headers(headers);

  if (!responseHeaders.has("Content-Type")) {
    responseHeaders.set("Content-Type", "application/json");
  }

  return new Response(JSON.stringify({ success: false, message }), { headers: responseHeaders });
}
