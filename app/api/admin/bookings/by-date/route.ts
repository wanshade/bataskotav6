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
    const { eq, desc, sql } = await import('drizzle-orm');

    const statsOnly = searchParams.get('stats') === '1';

    if (statsOnly) {
      const [row] = await db
        .select({
          total: sql<number>`count(*)::int`,
          pending: sql<number>`coalesce(sum(case when ${bookings.status} = 'pending' then 1 else 0 end), 0)::int`,
          confirmed: sql<number>`coalesce(sum(case when ${bookings.status} = 'confirmed' then 1 else 0 end), 0)::int`,
          cancelled: sql<number>`coalesce(sum(case when ${bookings.status} = 'cancelled' then 1 else 0 end), 0)::int`,
          revenue: sql<number>`
            coalesce(sum(
              case
                when ${bookings.status} = 'confirmed' and ${bookings.paymentStatus} = 'paid' then ${bookings.totalPrice}
                when ${bookings.status} = 'confirmed' and ${bookings.paymentStatus} = 'dp' then coalesce(${bookings.dpAmount}, 0)
                else 0
              end
            ), 0)::bigint
          `,
          pendingRevenue: sql<number>`
            coalesce(sum(
              case
                when ${bookings.status} = 'confirmed' and ${bookings.paymentStatus} = 'dp' then ${bookings.totalPrice} - coalesce(${bookings.dpAmount}, 0)
                when ${bookings.status} = 'confirmed' and ${bookings.paymentStatus} = 'pending' then ${bookings.totalPrice}
                else 0
              end
            ), 0)::bigint
          `,
          dpCount: sql<number>`
            coalesce(sum(
              case when ${bookings.status} = 'confirmed' and ${bookings.paymentStatus} = 'dp' then 1 else 0 end
            ), 0)::int
          `,
        })
        .from(bookings)
        .where(eq(bookings.bookingDate, date));

      return NextResponse.json({
        stats: {
          total: Number(row?.total || 0),
          pending: Number(row?.pending || 0),
          confirmed: Number(row?.confirmed || 0),
          cancelled: Number(row?.cancelled || 0),
          revenue: Number(row?.revenue || 0),
          pendingRevenue: Number(row?.pendingRevenue || 0),
          dpCount: Number(row?.dpCount || 0),
        },
        usingDatabase: true,
      });
    }

    const rows = await db
      .select()
      .from(bookings)
      .where(eq(bookings.bookingDate, date))
      .orderBy(desc(bookings.createdAt));

    return NextResponse.json({ bookings: rows, usingDatabase: true });
  } catch (error) {
    console.error('By-date bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
