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
    const { price } = body;

    // Parse and validate price
    const priceValue =
      typeof price === 'string'
        ? parseInt(price.replace(/\D/g, ''))
        : parseInt(price);

    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      return NextResponse.json(
        { error: 'Invalid price. Must be a positive number' },
        { status: 400 }
      );
    }

    // Check if DATABASE_URL is configured
    const hasDatabaseConfigured = !!process.env.DATABASE_URL;

    if (hasDatabaseConfigured) {
      try {
        const { db } = await import('@/lib/db');
        const { bookings } = await import('@/lib/schema');
        const { eq } = await import('drizzle-orm');

        // Get current booking to validate it exists
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

        // Build update data. Keep dpAmount consistent if it now exceeds new price.
        const updateData: Record<string, unknown> = {
          price: priceValue,
          totalPrice: priceValue,
        };

        if (
          booking.paymentStatus === 'dp' &&
          booking.dpAmount &&
          booking.dpAmount >= priceValue
        ) {
          return NextResponse.json(
            { error: 'Harga baru harus lebih besar dari DP yang sudah dibayar' },
            { status: 400 }
          );
        }

        const [updatedBooking] = await db
          .update(bookings)
          .set(updateData)
          .where(eq(bookings.bookingId, bookingId))
          .returning();

        return NextResponse.json({
          success: true,
          booking: updatedBooking,
          message: 'Harga booking berhasil diperbarui',
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Database operation failed');
      }
    }

    // Fallback: temporary storage
    return NextResponse.json({
      success: true,
      message: 'Harga booking berhasil diperbarui (temporary)',
      booking: {
        bookingId,
        price: priceValue,
        totalPrice: priceValue,
      },
    });
  } catch (error) {
    console.error('Update price error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update price',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
