CREATE TABLE IF NOT EXISTS "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"team_name" text NOT NULL,
	"phone" text NOT NULL,
	"booking_date" text NOT NULL,
	"time_slot" text NOT NULL,
	"price" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	CONSTRAINT "bookings_booking_id_unique" UNIQUE("booking_id")
);
