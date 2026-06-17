import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    

    // Check if DATABASE_URL is configured
    const hasDatabaseConfigured = !!process.env.DATABASE_URL;

    if (hasDatabaseConfigured) {
      try {
        const { db } = await import('@/lib/db');
        const { bookings } = await import('@/lib/schema');
        const { eq } = await import('drizzle-orm');

        // Update booking status to cancelled
        const [updatedBooking] = await db
          .update(bookings)
          .set({
            status: 'cancelled',
            approvedBy: session.user.email || 'admin'
          })
          .where(eq(bookings.bookingId, bookingId))
          .returning();

        if (!updatedBooking) {
          return NextResponse.json(
            { error: 'Booking not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          booking: updatedBooking,
          message: 'Booking rejected successfully'
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        return NextResponse.json(
          { error: 'Database operation failed' },
          { status: 500 }
        );
      }
    } else {
      // For temporary storage, this would need more complex implementation
      return NextResponse.json(
        { error: 'Database not configured. Cannot update booking status.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Reject booking error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to reject booking',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
