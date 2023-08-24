import { and, eq, lt } from "drizzle-orm";

import { CreateLogInput } from "./logging.schema";

import { db } from "../../config/db";
import { logs as logsTable } from "../../config/db/schema";

import { createDbId, dbPrefixes } from "../../utils/db";

export async function createLog(data: CreateLogInput & { serviceId: string; isPersisted?: boolean }) {
  const newId = createDbId(dbPrefixes.log);
  const log = await db
    .insert(logsTable)
    .values({
      id: newId,
      serviceId: data.serviceId,

      action: data.action,
      environment: data.environment,
      ip: data.ip,
      data: data.data || {},
      isPersisted: data.isPersisted || false,
      lookupFilterValue: data.lookupFilterValue,
    })
    .returning({
      id: logsTable.id,
      action: logsTable.id,
      environment: logsTable.environment,
      ip: logsTable.ip,
      lookupFilterValue: logsTable.lookupFilterValue,
      data: logsTable.data,

      serviceId: logsTable.serviceId,
      createdAt: logsTable.createdAt,
    })
    .execute();

  return { ...log[0], data: Object.keys(log[0]?.data ?? {}).length === 0 ? null : log[0].data };
}

export async function getLogs({
  skip = 0,
  limit = 500,
  sortDirection = "desc",
  ...data
}: {
  serviceId: string;
  environment?: string;
  lookupValue?: string;
  sortDirection?: "asc" | "desc";
  limit?: number;
  skip?: number;
}) {
  const logs = await db.query.logs.findMany({
    limit,
    offset: skip,
    orderBy: (table, { asc, desc }) => (sortDirection === "asc" ? asc(table.createdAt) : desc(table.createdAt)),
    where: (table, { and, eq }) =>
      and(
        ...[eq(table.serviceId, data.serviceId)],
        ...(data.environment ? [eq(table.environment, data.environment)] : []),
        ...(data.lookupValue ? [eq(table.lookupFilterValue, data.lookupValue)] : []),
      ),
  });

  return logs.map((log) => ({
    ...log,
    data: Object.keys(log.data ?? {}).length === 0 ? null : log.data,
  }));
}

/**
 * Clean logs for all services older than x number of months
 *
 * Currently, the number of months is defined in the env file
 */
export async function cleanLogsForAll({ numberOfMonthsToRemove }: { numberOfMonthsToRemove: number }) {
  const date = new Date();
  date.setMonth(date.getMonth() - numberOfMonthsToRemove);

  await db
    .delete(logsTable)
    .where(and(eq(logsTable.isPersisted, false), lt(logsTable.createdAt, date.toISOString())))
    .execute();

  return true;
}
