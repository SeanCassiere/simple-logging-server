import { relations } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

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

export const tenants = pgTable("tenants", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const tenantRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  // services: many(services),
}));

export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  username: text("username").notNull(),
  githubId: text("github_id").unique(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  tenants: many(tenants),
  sessions: many(sessions),
}));

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
