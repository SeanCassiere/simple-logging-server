ALTER TABLE "logs" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "logs" RENAME COLUMN "service_id" TO "serviceId";--> statement-breakpoint
ALTER TABLE "logs" RENAME COLUMN "lookup_filter_value" TO "lookupFilterValue";--> statement-breakpoint
ALTER TABLE "logs" RENAME COLUMN "is_persisted" TO "isPersisted";--> statement-breakpoint
ALTER TABLE "services" RENAME COLUMN "is_active" TO "isActive";--> statement-breakpoint
ALTER TABLE "services" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "services" RENAME COLUMN "is_persisted" TO "isPersisted";--> statement-breakpoint
ALTER TABLE "services" RENAME COLUMN "is_admin" TO "isAdmin";--> statement-breakpoint
ALTER TABLE "services" RENAME COLUMN "tenant_id" TO "tenantId";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "expires_at" TO "expiresAt";--> statement-breakpoint
ALTER TABLE "sessions" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "tenants" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "tenants" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "github_id" TO "githubId";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER TABLE "users_to_tenants" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "users_to_tenants" RENAME COLUMN "tenant_id" TO "tenantId";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_github_id_unique";--> statement-breakpoint
ALTER TABLE "logs" DROP CONSTRAINT "logs_service_id_services_id_fk";
--> statement-breakpoint
ALTER TABLE "services" DROP CONSTRAINT "services_tenant_id_tenants_id_fk";
--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_tenants" DROP CONSTRAINT "users_to_tenants_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "users_to_tenants" DROP CONSTRAINT "users_to_tenants_tenant_id_tenants_id_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "log_created_at_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "service_created_at_idx";--> statement-breakpoint
DROP INDEX IF EXISTS "service_tenant_idx";--> statement-breakpoint
ALTER TABLE "users_to_tenants" DROP CONSTRAINT "users_to_tenants_user_id_tenant_id_pk";--> statement-breakpoint
ALTER TABLE "users_to_tenants" ADD CONSTRAINT "users_to_tenants_userId_tenantId_pk" PRIMARY KEY("userId","tenantId");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logs" ADD CONSTRAINT "logs_serviceId_services_id_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "services" ADD CONSTRAINT "services_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_tenants" ADD CONSTRAINT "users_to_tenants_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_tenants" ADD CONSTRAINT "users_to_tenants_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "log_created_at_idx" ON "logs" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_created_at_idx" ON "services" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_tenant_idx" ON "services" USING btree ("tenantId");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_githubId_unique" UNIQUE("githubId");