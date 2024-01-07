import { pgTable, timestamp, text, index, jsonb, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const logs = pgTable(
  "logs",
  {
    id: text("id").primaryKey().notNull(),
    action: text("action").notNull(),
    environment: text("environment").notNull(),
    ip: text("ip"),
    data: jsonb("data"),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" }).defaultNow().notNull(),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade", onUpdate: "cascade" }),
    level: text("level").default("info").notNull(),
    lookupFilterValue: text("lookup_filter_value"),
    isPersisted: boolean("is_persisted").notNull(),
  },
  (table) => {
    return {
      createdAtIdx: index("log_created_at_idx").on(table.createdAt),
      levelIdx: index("log_level_idx").on(table.level),
    };
  },
);

export const logRelations = relations(logs, ({ one }) => ({
  service: one(services, {
    fields: [logs.serviceId],
    references: [services.id],
  }),
}));

export const services = pgTable(
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
  },
);

export const serviceRelations = relations(services, ({ many }) => ({
  logs: many(logs),
}));
