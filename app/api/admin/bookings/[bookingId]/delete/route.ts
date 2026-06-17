import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ bookingId: string }> }
) {
    const { bookingId } = await params;
    try {
        // Check if user is authenticated and is admin or superadmin
        const session = await getServerSession(authOptions);

        if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'superadmin')) {
            return NextResponse.json(
                { error: 'Unauthorized. Only admin can delete bookings.' },
                { status: 403 }
            );
        }

        // Check if DATABASE_URL is configured
        const hasDatabaseConfigured = !!process.env.DATABASE_URL;

        if (hasDatabaseConfigured) {
            try {
                const { db } = await import('@/lib/db');
                const { bookings } = await import('@/lib/schema');
                const { eq } = await import('drizzle-orm');

                // Delete the booking
                const [deletedBooking] = await db
                    .delete(bookings)
                    .where(eq(bookings.bookingId, bookingId))
                    .returning();

                if (!deletedBooking) {
                    return NextResponse.json(
                        { error: 'Booking not found' },
                        { status: 404 }
                    );
                }

                return NextResponse.json({
                    success: true,
                    message: `Booking ${bookingId} deleted successfully`,
                    booking: deletedBooking
                });
            } catch (dbError) {
                console.error('Database error:', dbError);
                return NextResponse.json(
                    { error: 'Database operation failed' },
                    { status: 500 }
                );
            }
        } else {
            return NextResponse.json(
                { error: 'Database not configured. Cannot delete booking.' },
                { status: 503 }
            );
        }
    } catch (error) {
        console.error('Delete booking error:', error);

        return NextResponse.json(
            {
                error: 'Failed to delete booking',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
