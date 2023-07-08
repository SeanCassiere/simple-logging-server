import { eq } from "drizzle-orm";

import { db } from "../../config/db";
import { services as serviceTable } from "../../config/db/schema";

export async function findActiveService(data: { serviceId: string; isAdmin?: boolean }) {
  const service = await db.query.services.findFirst({ where: eq(serviceTable.id, data.serviceId) });
  return service ?? null;
}
