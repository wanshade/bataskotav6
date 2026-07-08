ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "add_dokumentasi" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "add_wasit" boolean DEFAULT false;
