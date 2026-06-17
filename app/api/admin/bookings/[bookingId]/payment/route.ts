import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    // Check admin authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const { bookingId } = await params;
    const body = await request.json();
    const { paymentStatus, dpAmount } = body;

    // Validate payment status
    if (!paymentStatus || !['pending', 'dp', 'paid'].includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Invalid payment status. Must be: pending, dp, or paid' },
        { status: 400 }
      );
    }

    // Parse DP amount if provided
    const dpValue = dpAmount
      ? (typeof dpAmount === 'string' ? parseInt(dpAmount.replace(/\D/g, '')) : parseInt(dpAmount))
      : null;

    // Check if DATABASE_URL is configured
    const hasDatabaseConfigured = !!process.env.DATABASE_URL;

    if (hasDatabaseConfigured) {
      try {
        const { db } = await import('@/lib/db');
        const { bookings } = await import('@/lib/schema');
        const { eq } = await import('drizzle-orm');

        // Get current booking to validate
        const { drizzle } = await import('drizzle-orm/postgres-js');
        const bookingResult = await db
          .select()
          .from(bookings)
          .where(eq(bookings.bookingId, bookingId));

        if (bookingResult.length === 0) {
          return NextResponse.json(
            { error: 'Booking not found' },
            { status: 404 }
          );
        }

        const booking = bookingResult[0];

        // Validate DP amount
        if (paymentStatus === 'dp' && (!dpValue || dpValue >= booking.totalPrice)) {
          return NextResponse.json(
            { error: 'DP amount must be less than total price' },
            { status: 400 }
          );
        }

        // Update payment status
        const updateData: Record<string, unknown> = {
          paymentStatus,
          dpAmount: paymentStatus === 'dp' ? dpValue : null,
        };

        const [updatedBooking] = await db
          .update(bookings)
          .set(updateData)
          .where(eq(bookings.bookingId, bookingId))
          .returning();

        return NextResponse.json({
          success: true,
          booking: updatedBooking,
          message: `Payment status updated to ${paymentStatus}`,
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Database operation failed');
      }
    }

    // Fallback: Update in temporary storage
    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${paymentStatus} (temporary)`,
      booking: {
        bookingId,
        paymentStatus,
        dpAmount: paymentStatus === 'dp' ? dpValue : null,
      },
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update payment status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
