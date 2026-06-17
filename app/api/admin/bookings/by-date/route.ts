import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

// GET /api/admin/bookings/by-date?date=<localized booking date string>
// bookingDate is stored as a localized string, so we match it exactly.
export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ bookings: [], usingDatabase: false });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 });
    }

    const { db } = await import('@/lib/db');
    const { bookings } = await import('@/lib/schema');
    const { eq } = await import('drizzle-orm');

    const rows = await db
      .select()
      .from(bookings)
      .where(eq(bookings.bookingDate, date));

    return NextResponse.json({ bookings: rows, usingDatabase: true });
  } catch (error) {
    console.error('By-date bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
