import { NextRequest, NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm';
import * as dotenv from 'dotenv';

// Load env variables explicitly
dotenv.config({ path: '.env.local' });

// Temporary in-memory storage for bookings (for testing without database)
const tempBookings: Record<string, unknown>[] = [];

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

        // --- DOUBLE BOOKING PREVENTION ---
        // Check for existing bookings on the same date with overlapping time slots
        const requestedSlots = timeSlot.split(', ').map((s: string) => s.trim());

        const existingBookings = await db
          .select()
          .from(bookings)
          .where(
            and(
              eq(bookings.bookingDate, bookingDate),
              inArray(bookings.status, ['pending', 'confirmed'])
            )
          );

        // Check each requested slot against existing bookings
        for (const reqSlot of requestedSlots) {
          const conflict = existingBookings.find(b =>
            b.timeSlot.split(', ').some(ts => hasTimeOverlap(ts, reqSlot))
          );
          if (conflict) {
            return NextResponse.json(
              {
                error: 'Slot sudah dipesan',
                message: `Slot ${reqSlot} pada ${bookingDate} sudah dipesan oleh tim lain. Silakan pilih waktu lain.`,
              },
              { status: 409 }
            );
          }
        }

        // Generate unique booking ID
        const bookingId = generateBookingId();

        const [newBooking] = await db
          .insert(bookings)
          .values({
            bookingId,
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

export async function GET() {
  try {
    console.log('📖 Fetching all bookings...');
    const hasDatabaseConfigured = !!process.env.DATABASE_URL;
    console.log('🔗 Database configured:', hasDatabaseConfigured);

    if (hasDatabaseConfigured) {
      try {
        console.log('📦 Importing database modules for GET...');
        const { db } = await import('@/lib/db');
        const { bookings } = await import('@/lib/schema');

        console.log('🔍 Querying database for bookings...');
        const allBookings = await db.select().from(bookings);
        console.log('✅ Found bookings in database:', allBookings.length);
        
        return NextResponse.json({ 
          bookings: allBookings,
          usingDatabase: true 
        });
      } catch (dbError) {
        console.error('❌ Database error in GET, returning temporary bookings:', dbError);
        console.error('❌ Full error details for GET:', dbError);
        // Fall through to temporary storage
      }
    }

    // Return temporary bookings
    console.log('📝 Returning temporary bookings:', tempBookings.length);
    return NextResponse.json({ 
      bookings: tempBookings,
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
