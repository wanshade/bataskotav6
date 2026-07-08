CREATE TABLE IF NOT EXISTS "pricing" (
	"id" serial PRIMARY KEY NOT NULL,
	"day_group" text NOT NULL,
	"time_slot" text NOT NULL,
	"price" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pg_trgm;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_created_at_idx" ON "bookings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_booking_date_idx" ON "bookings" USING btree ("booking_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_team_name_idx" ON "bookings" USING btree ("team_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_status_created_at_idx" ON "bookings" USING btree ("status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_booking_date_created_at_idx" ON "bookings" USING btree ("booking_date","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_booking_date_status_created_at_idx" ON "bookings" USING btree ("booking_date","status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_team_name_trgm_idx" ON "bookings" USING gin ("team_name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_booking_id_trgm_idx" ON "bookings" USING gin ("booking_id" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_phone_trgm_idx" ON "bookings" USING gin ("phone" gin_trgm_ops);
