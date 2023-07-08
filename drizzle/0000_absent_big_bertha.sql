CREATE TABLE IF NOT EXISTS "logs" (
	"id" text PRIMARY KEY NOT NULL,
	"action" text,
	"environment" text,
	"ip" text,
	"data" jsonb,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"service_id" text NOT NULL,
	"lookup_filter_value" text,
	"is_persisted" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "services" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean NOT NULL,
	"created_at" timestamp(3) DEFAULT now() NOT NULL,
	"is_persisted" boolean NOT NULL,
	"is_admin" boolean NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "log_created_at_idx" ON "logs" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "service_created_at_idx" ON "services" ("created_at");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "logs" ADD CONSTRAINT "logs_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
