CREATE TABLE IF NOT EXISTS "users_to_tenants" (
	"user_id" text NOT NULL,
	"tenant_id" text NOT NULL,
	CONSTRAINT "users_to_tenants_user_id_tenant_id_pk" PRIMARY KEY("user_id","tenant_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_tenants" ADD CONSTRAINT "users_to_tenants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_to_tenants" ADD CONSTRAINT "users_to_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
