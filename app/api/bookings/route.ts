import { NextRequest, NextResponse } from 'next/server';
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
    console.log('🔍 DATABASE_URL check:', {
      exists: hasDatabaseConfigured,
      value: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'not set'
    });

    if (hasDatabaseConfigured) {
      // Try to save to database
      console.log('🗄️ Attempting to save to database...');
      console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
      console.log('DATABASE_URL value:', process.env.DATABASE_URL?.substring(0, 30) + '...');
      
      try {
        // Dynamic import with error handling
        let db, bookings, generateBookingId;
        
        try {
          console.log('📦 Importing database modules...');
          const dbModule = await import('@/lib/db');
          const schemaModule = await import('@/lib/schema');
          db = dbModule.db;
          bookings = schemaModule.bookings;
          generateBookingId = schemaModule.generateBookingId;
          console.log('✅ Database modules imported successfully');
        } catch (importError) {
          console.error('❌ Failed to import database modules:', importError);
          throw new Error('Database connection failed');
        }

        // Generate unique booking ID
        const bookingId = generateBookingId();
        console.log('🎫 Generated booking ID:', bookingId);

        console.log('💾 Inserting booking into database...');
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

        console.log('✅ Booking saved to database:', newBooking);

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
        console.error('❌ Database error, falling back to temporary storage:', errorMessage);
        console.error('❌ Full error details:', dbError);
        console.error('❌ Error stack:', dbError instanceof Error ? dbError.stack : 'No stack');
        // Return error response instead of silently falling back
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
    // Generate booking ID for temporary storage too
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
    
    console.log('Booking saved temporarily (not in database):', tempBooking);
    console.log('Total temporary bookings:', tempBookings.length);

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
