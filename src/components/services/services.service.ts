import { desc, eq } from "drizzle-orm";

import { db } from "../../config/db";
import { services as serviceTable } from "../../config/db/schema";

export async function findActiveService(data: { serviceId: string; isAdmin?: boolean }) {
  const service = await db.query.services.findFirst({ where: eq(serviceTable.id, data.serviceId) });
  if (data.isAdmin && service && service.isActive && service.isAdmin) {
    return service;
  } else if (service && service.isActive) {
    return service;
  }

  return null;
}

export async function findAllServices() {
  return await db.query.services.findMany({ orderBy: desc(serviceTable.createdAt) });
}

export async function findServiceById(data: { serviceId: string }) {
  return (await db.query.services.findFirst({ where: eq(serviceTable.id, data.serviceId) })) ?? null;
}
