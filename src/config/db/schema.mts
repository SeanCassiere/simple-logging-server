import { relations } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

export const logs = pgTable(
  "logs",
  {
    id: text().primaryKey().notNull(),
    action: text().notNull(),
    environment: text().notNull(),
    ip: text(),
    data: jsonb(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" }).defaultNow().notNull(),
    serviceId: text("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade", onUpdate: "cascade" }),
    level: text().default("info").notNull(),
    lookupFilterValue: text("lookup_filter_value"),
    isPersisted: boolean("is_persisted").notNull(),
  },
  (t) => ({
    createdAtIdx: index("log_created_at_idx").on(t.createdAt),
    levelIdx: index("log_level_idx").on(t.level),
  }),
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
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    isActive: boolean("is_active").notNull(),
    createdAt: timestamp("created_at", { precision: 3, mode: "string" }).defaultNow().notNull(),
    isPersisted: boolean("is_persisted").notNull(),
    isAdmin: boolean("is_admin").notNull(),
    tenantId: text("tenant_id").references(() => tenants.id),
  },
  (t) => ({
    createdAtIdx: index("service_created_at_idx").on(t.createdAt),
    serviceTenantIdx: index("service_tenant_idx").on(t.tenantId),
  }),
);

export const serviceRelations = relations(services, ({ many, one }) => ({
  logs: many(logs),
  tenant: one(tenants, {
    fields: [services.tenantId],
    references: [tenants.id],
  }),
}));

export const tenants = pgTable("tenants", {
  id: text().primaryKey().notNull(),
  name: text().notNull(),
  workspace: text().notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const tenantRelations = relations(tenants, ({ many }) => ({
  usersToTenants: many(usersToTenants),
  services: many(services),
}));

export const users = pgTable("users", {
  id: text().primaryKey().notNull(),
  username: text().notNull(),
  githubId: text("github_id").unique(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  usersToTenants: many(usersToTenants),
  sessions: many(sessions),
}));

export const usersToTenants = pgTable(
  "users_to_tenants",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (t) => ({
    id: primaryKey({ columns: [t.userId, t.tenantId] }),
  }),
);

export const usersToTenantsRelations = relations(usersToTenants, ({ one }) => ({
  tenant: one(tenants, {
    fields: [usersToTenants.tenantId],
    references: [tenants.id],
  }),
  user: one(users, {
    fields: [usersToTenants.userId],
    references: [users.id],
  }),
}));

export const sessions = pgTable("sessions", {
  id: text().primaryKey().notNull(),
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
