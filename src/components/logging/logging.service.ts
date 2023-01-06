import { prisma } from "../../config/prisma";
import { CreateLogInput } from "./logging.schema";

export async function createLog(data: CreateLogInput & { serviceId: string; isPersisted?: boolean }) {
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

/**
 * Clean logs for all services older than x number of months
 *
 * Currently, the number of months is defined in the env file
 */
export async function cleanLogsForAll({ numberOfMonthsToRemove }: { numberOfMonthsToRemove: number }) {
  const date = new Date();
  date.setMonth(date.getMonth() - numberOfMonthsToRemove);

  await prisma.log.deleteMany({
    where: { isPersisted: false, createdAt: { lt: date } },
  });
}
