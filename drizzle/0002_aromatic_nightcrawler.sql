ALTER TABLE "logs" ADD COLUMN "level" text DEFAULT 'info' NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "log_level_idx" ON "logs" ("level");