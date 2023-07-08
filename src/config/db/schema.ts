import { pgTable, timestamp, text, index, jsonb, boolean } from "drizzle-orm/pg-core";

export const log = pgTable(
  "logs",
  {
    id: text("id").primaryKey().notNull(),
    action: text("action"),
    environment: text("environment"),
    ip: text("ip"),
    data: jsonb("data"),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" }).defaultNow().notNull(),
    serviceId: text("service_id")
      .notNull()
      .references(() => service.id, { onDelete: "cascade", onUpdate: "cascade" }),
    lookupFilterValue: text("lookup_filter_value"),
    isPersisted: boolean("is_persisted").notNull(),
  },
  (table) => {
    return {
      createdAtIdx: index("log_created_at_idx").on(table.createdAt),
    };
  }
);

export const service = pgTable(
  "services",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    isActive: boolean("is_active").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" }).defaultNow().notNull(),
    isPersisted: boolean("is_persisted").notNull(),
    isAdmin: boolean("is_admin").notNull(),
  },
  (table) => {
    return {
      createdAtIdx: index("service_created_at_idx").on(table.createdAt),
    };
  }
);
