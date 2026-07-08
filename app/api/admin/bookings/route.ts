import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { and, eq, inArray } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { teamName, phone, bookingDate, timeSlot, price, paymentStatus = 'pending', dpAmount, dokumentasi, wasit } = body;

    // Validate required fields
    if (!teamName || !phone || !bookingDate || !timeSlot || !price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse price
    const priceValue = typeof price === 'string'
      ? parseInt(price.replace(/\D/g, ''))
      : parseInt(price);

    // Parse DP amount
    const dpValue = dpAmount
      ? (typeof dpAmount === 'string' ? parseInt(dpAmount.replace(/\D/g, '')) : parseInt(dpAmount))
      : null;

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

        for (const reqSlot of requestedSlots) {
          const conflict = existingBookings.find(b =>
            b.timeSlot.split(', ').some(ts => hasTimeOverlap(ts, reqSlot))
          );
          if (conflict) {
            return NextResponse.json(
              {
                error: 'Slot sudah dipesan',
                message: `Slot ${reqSlot} pada ${bookingDate} sudah dipesan oleh ${conflict.teamName}. Silakan pilih waktu lain.`,
              },
              { status: 409 }
            );
          }
        }

        // Generate unique booking ID
        const bookingId = generateBookingId();

        // Insert booking with confirmed status (admin-created bookings are auto-confirmed)
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
            status: 'confirmed', // Admin bookings are auto-confirmed
            approvedAt: new Date(),
            approvedBy: session.user?.name || 'Admin',
            addDokumentasi: !!dokumentasi,
            addWasit: !!wasit,
          })
          .returning();

        return NextResponse.json(
          { 
            success: true, 
            booking: newBooking,
            message: 'Booking created successfully by admin'
          },
          { status: 201 }
        );
      } catch (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Database operation failed');
      }
    }

    // Fallback to temporary storage
    const generateTempBookingId = () => {
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      return `BK-${date}-${random}`;
    };

    const tempBooking = {
      id: Date.now(),
      bookingId: generateTempBookingId(),
      teamName,
      phone,
      bookingDate,
      timeSlot,
      price: priceValue,
      totalPrice: priceValue,
      paymentStatus,
      dpAmount: dpValue,
      status: 'confirmed',
      approvedAt: new Date().toISOString(),
      approvedBy: session.user?.name || 'Admin',
      addDokumentasi: !!dokumentasi,
      addWasit: !!wasit,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { 
        success: true, 
        booking: tempBooking,
        message: 'Booking created (temporary storage)',
        warning: 'Database not configured'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin booking creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create booking', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
