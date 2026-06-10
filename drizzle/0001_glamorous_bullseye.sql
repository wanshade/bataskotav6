DO $$
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'total_price') THEN
        ALTER TABLE "bookings" ADD COLUMN "total_price" integer;
        UPDATE "bookings" SET "total_price" = "price" WHERE "total_price" IS NULL;
        ALTER TABLE "bookings" ALTER COLUMN "total_price" SET NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'payment_status') THEN
        ALTER TABLE "bookings" ADD COLUMN "payment_status" text DEFAULT 'pending';
        UPDATE "bookings" SET "payment_status" = 'pending' WHERE "payment_status" IS NULL;
        ALTER TABLE "bookings" ALTER COLUMN "payment_status" SET NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'dp_amount') THEN
        ALTER TABLE "bookings" ADD COLUMN "dp_amount" integer;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'approved_at') THEN
        ALTER TABLE "bookings" ADD COLUMN "approved_at" timestamp;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'approved_by') THEN
        ALTER TABLE "bookings" ADD COLUMN "approved_by" text;
    END IF;
END $$;