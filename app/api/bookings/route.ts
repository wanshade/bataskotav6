import { NextRequest, NextResponse } from 'next/server';
import { and, eq, inArray, sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load env variables explicitly
dotenv.config({ path: '.env.local' });

// Temporary in-memory storage for bookings (for testing without database)
const tempBookings: Record<string, unknown>[] = [];

class BookingConflictError extends Error {
  constructor(
    public readonly slot: string,
    public readonly bookingDate: string,
  ) {
    super(`Slot ${slot} pada ${bookingDate} sudah dipesan.`);
    this.name = 'BookingConflictError';
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamName, phone, bookingDate, timeSlot, price } = body;

    // Validate required fields
    if (!teamName || !phone || !bookingDate || !timeSlot || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse price (remove currency formatting and convert to number)
    const priceValue = parseInt(price.replace(/\D/g, ''));

    // Get payment details and add-ons from request
    const { paymentStatus = 'pending', dpAmount, dokumentasi, wasit } = body;
    const dpValue = dpAmount ? parseInt(dpAmount.toString().replace(/\D/g, '')) : null;

    // Validate DP amount
    if (paymentStatus === 'dp' && (!dpValue || dpValue >= priceValue)) {
      return NextResponse.json(
        { error: 'DP amount must be less than total price' },
        { status: 400 }
      );
    }

    // Check if DATABASE_URL is configured
    const hasDatabaseConfigured = !!process.env.DATABASE_URL;

    if (hasDatabaseConfigured) {
      try {
        const { db } = await import('@/lib/db');
        const { bookings, generateBookingId } = await import('@/lib/schema');
        const { hasTimeOverlap } = await import('@/lib/schedule');

        const requestedSlots = timeSlot.split(', ').map((s: string) => s.trim());

        const newBooking = await db.transaction(async (tx) => {
          // Serialize every booking write for the same date until this transaction ends.
          await tx.execute(
            sql`select pg_advisory_xact_lock(hashtextextended(${bookingDate}, 0))`,
          );

          const existingBookings = await tx
            .select({ timeSlot: bookings.timeSlot })
            .from(bookings)
            .where(
              and(
                eq(bookings.bookingDate, bookingDate),
                inArray(bookings.status, ['pending', 'confirmed'])
              )
            );

          for (const requestedSlot of requestedSlots) {
            const hasConflict = existingBookings.some((booking) =>
              booking.timeSlot
                .split(', ')
                .some((bookedSlot) => hasTimeOverlap(bookedSlot, requestedSlot)),
            );

            if (hasConflict) {
              throw new BookingConflictError(requestedSlot, bookingDate);
            }
          }

          const [createdBooking] = await tx
            .insert(bookings)
            .values({
              bookingId: generateBookingId(),
              teamName,
              phone,
              bookingDate,
              timeSlot,
              price: priceValue,
              totalPrice: priceValue,
              paymentStatus,
              dpAmount: dpValue,
              status: 'pending',
              addDokumentasi: !!dokumentasi,
              addWasit: !!wasit,
            })
            .returning();

          return createdBooking;
        });

        return NextResponse.json(
          { 
            success: true, 
            booking: newBooking,
            message: 'Booking saved to database successfully',
            usingDatabase: true
          },
          { status: 201 }
        );
      } catch (dbError) {
        if (dbError instanceof BookingConflictError) {
          return NextResponse.json(
            {
              error: 'Slot sudah dipesan',
              message: `${dbError.message} Silakan pilih waktu lain.`,
            },
            { status: 409 },
          );
        }

        const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
        console.error('Database error:', errorMessage);
        return NextResponse.json(
          {
            success: false,
            error: 'Database error',
            message: errorMessage,
            details: dbError instanceof Error ? dbError.message : 'Unknown database error'
          },
          { status: 500 }
        );
      }
    }

    // Fallback: Save to temporary in-memory storage
    const generateTempBookingId = () => {
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `BK-${date}-${random}`;
    };

    const tempBooking = {
      id: tempBookings.length + 1,
      bookingId: generateTempBookingId(),
      teamName,
      phone,
      bookingDate,
      timeSlot,
      price: priceValue,
      totalPrice: priceValue,
      paymentStatus,
      dpAmount: dpValue,
      status: 'pending',
      addDokumentasi: !!dokumentasi,
      addWasit: !!wasit,
      createdAt: new Date().toISOString(),
    };
    
    tempBookings.push(tempBooking);

    return NextResponse.json(
      { 
        success: true, 
        booking: tempBooking,
        message: 'Booking created successfully (temporary - not saved to database)',
        warning: 'Database not configured. This booking is stored temporarily and will be lost on server restart. See DATABASE_SETUP.md to set up database.',
        usingDatabase: false
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create booking', 
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const bookingDate = request.nextUrl.searchParams.get('date')?.trim();

    if (!bookingDate) {
      return NextResponse.json(
        { error: 'Parameter date wajib diisi.' },
        { status: 400 },
      );
    }

    const hasDatabaseConfigured = !!process.env.DATABASE_URL;

    if (hasDatabaseConfigured) {
      try {
        const { db } = await import('@/lib/db');
        const { bookings } = await import('@/lib/schema');

        const dayBookings = await db
          .select({
            bookingDate: bookings.bookingDate,
            timeSlot: bookings.timeSlot,
            status: bookings.status,
          })
          .from(bookings)
          .where(
            and(
              eq(bookings.bookingDate, bookingDate),
              inArray(bookings.status, ['pending', 'confirmed']),
            ),
          );

        return NextResponse.json({ bookings: dayBookings, usingDatabase: true });
      } catch (dbError) {
        console.error('❌ Database error in GET, returning temporary bookings:', dbError);
        console.error('❌ Full error details for GET:', dbError);
        // Fall through to temporary storage
      }
    }

    // Return temporary bookings
    const fallbackBookings = tempBookings
      .filter((booking) => booking.bookingDate === bookingDate)
      .filter((booking) => booking.status === 'pending' || booking.status === 'confirmed')
      .map((booking) => ({
        bookingDate: booking.bookingDate,
        timeSlot: booking.timeSlot,
        status: booking.status,
      }));
    return NextResponse.json({ 
      bookings: fallbackBookings,
      usingDatabase: false,
      warning: 'Showing temporary bookings (not from database)'
    });
  } catch (error) {
    console.error('💥 Fetch bookings error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch bookings',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
