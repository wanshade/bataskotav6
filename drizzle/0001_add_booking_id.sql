-- Add booking_id column to existing bookings table
-- Step 1: Add column as nullable first
ALTER TABLE "bookings" ADD COLUMN "booking_id" text;

-- Step 2: Generate booking IDs for existing records
UPDATE "bookings" 
SET "booking_id" = 'BK-' || TO_CHAR(created_at, 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 4))
WHERE "booking_id" IS NULL;

-- Step 3: Make it NOT NULL and UNIQUE
ALTER TABLE "bookings" ALTER COLUMN "booking_id" SET NOT NULL;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_booking_id_unique" UNIQUE("booking_id");
