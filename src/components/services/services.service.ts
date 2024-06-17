import { eq } from "drizzle-orm";

import { db } from "../../config/db";
import { services as serviceTable } from "../../config/db/schema";
import { createDbId, dbPrefixes } from "../../utils/db";
import type { CreateServiceInput } from "./services.schema";

export async function findActiveService(data: { serviceId: string; isAdmin?: boolean }) {
  const service = await db.query.services.findFirst({ where: (fields, { eq }) => eq(fields.id, data.serviceId) });

  if (data.isAdmin && service && service.isActive) {
    return service.isAdmin ? service : null;
  } else if (service && service.isActive) {
    return service;
  }

  return null;
}

export async function findAllServices() {
  const services = await db.query.services.findMany({ orderBy: (fields, { desc }) => desc(fields.createdAt) });
  return services;
}

export async function findServiceById(data: { serviceId: string }) {
  const service = await db.query.services.findFirst({ where: (fields, { eq }) => eq(fields.id, data.serviceId) });
  return service ?? null;
}

export async function createService(data: CreateServiceInput) {
  const newId = createDbId(dbPrefixes.service);
  const service = await db
    .insert(serviceTable)
    .values({
      id: newId,
      name: data.name,
      isPersisted: data.isPersisted,
      isActive: true,
      isAdmin: data.isAdmin,
    })
    .returning({
      id: serviceTable.id,
      name: serviceTable.name,
      isPersisted: serviceTable.isPersisted,
      isActive: serviceTable.isActive,
      isAdmin: serviceTable.isAdmin,
      createdAt: serviceTable.createdAt,
    })
    .execute();

  return service[0];
}

export async function disableService(data: { serviceId: string }) {
  await db.update(serviceTable).set({ isActive: false }).where(eq(serviceTable.id, data.serviceId)).execute();
}

export async function enableService(data: { serviceId: string }) {
  await db.update(serviceTable).set({ isActive: true }).where(eq(serviceTable.id, data.serviceId)).execute();
}
