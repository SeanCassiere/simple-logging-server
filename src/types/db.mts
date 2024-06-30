import type { services, tenants, users } from "@/config/db/schema.mjs";

export type ServiceRecord = typeof services.$inferSelect;
export type UserRecord = typeof users.$inferSelect;
export type TenantRecord = typeof tenants.$inferSelect;
