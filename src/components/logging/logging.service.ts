import { prisma } from "../../config/prisma";
import { CreateLogInput } from "./logging.schema";

export async function createLog(data: CreateLogInput & { serviceId: string }) {
  return await prisma.log.create({ data, include: { service: true } });
}

export async function getLogs({
  limit = 500,
  sortDirection = "desc",
  ...data
}: {
  serviceId?: string;
  environment?: string;
  lookupValue?: string;
  includeService?: boolean;
  sortDirection?: "asc" | "desc";
  limit?: number;
}) {
  return await prisma.log.findMany({
    where: {
      ...(data.serviceId ? { serviceId: { equals: data.serviceId } } : {}),
      ...(data.environment ? { environment: { equals: data.environment, mode: "insensitive" } } : {}),
      ...(data.lookupValue ? { lookupFilterValue: { equals: data.lookupValue, mode: "insensitive" } } : {}),
    },
    take: limit,
    orderBy: { createdAt: sortDirection },
    include: { service: data.includeService ? true : false },
  });
}
