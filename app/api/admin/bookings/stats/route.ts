import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

// GET /api/admin/bookings/stats
// Returns aggregate metrics computed in SQL + 5 most recent bookings.
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const empty = {
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    revenue: 0,
    pendingRevenue: 0,
    dpCount: 0,
    revenueByDate: [] as { date: string; revenue: number }[],
    weeklyTrend: [] as { day: string; bookings: number }[],
    recent: [] as unknown[],
    thisWeekBookings: 0,
    prevWeekBookings: 0,
    thisWeekRevenue: 0,
    prevWeekRevenue: 0,
  };

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ stats: empty, usingDatabase: false });
  }

  try {
    const { db } = await import('@/lib/db');
    const { bookings } = await import('@/lib/schema');
    const { sql, desc } = await import('drizzle-orm');

    const statusRowsQuery = db
      .select({
        status: bookings.status,
        count: sql<number>`count(*)::int`,
      })
      .from(bookings)
      .groupBy(bookings.status);

    const revenueQuery = db
      .select({
        revenue: sql<number>`
          coalesce(sum(
            case
              when ${bookings.paymentStatus} = 'paid' then ${bookings.totalPrice}
              when ${bookings.paymentStatus} = 'dp' then coalesce(${bookings.dpAmount}, 0)
              else 0
            end
          ), 0)::bigint
        `,
        pendingRevenue: sql<number>`
          coalesce(sum(
            case
              when ${bookings.paymentStatus} = 'dp' then ${bookings.totalPrice} - coalesce(${bookings.dpAmount}, 0)
              when ${bookings.paymentStatus} = 'pending' then ${bookings.totalPrice}
              else 0
            end
          ), 0)::bigint
        `,
        dpCount: sql<number>`coalesce(sum(case when ${bookings.paymentStatus} = 'dp' then 1 else 0 end), 0)::int`,
      })
      .from(bookings)
      .where(sql`${bookings.status} = 'confirmed'`);

    const revenueByDateQuery = db
      .select({
        date: sql<string>`to_char(${bookings.createdAt}, 'YYYY-MM-DD')`,
        revenue: sql<number>`
          coalesce(sum(
            case
              when ${bookings.paymentStatus} = 'paid' then ${bookings.totalPrice}
              when ${bookings.paymentStatus} = 'dp' then coalesce(${bookings.dpAmount}, 0)
              else 0
            end
          ), 0)::bigint
        `,
      })
      .from(bookings)
      .where(sql`${bookings.status} = 'confirmed' and ${bookings.createdAt} >= now() - interval '7 days'`)
      .groupBy(sql`to_char(${bookings.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${bookings.createdAt}, 'YYYY-MM-DD')`);

    const trendQuery = db
      .select({
        date: sql<string>`to_char(${bookings.createdAt}, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(bookings)
      .where(sql`${bookings.createdAt} >= now() - interval '7 days'`)
      .groupBy(sql`to_char(${bookings.createdAt}, 'YYYY-MM-DD')`);

    const recentQuery = db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt))
      .limit(5);

    const wowQuery = db
      .select({
        thisWeekBookings: sql<number>`coalesce(sum(case when ${bookings.createdAt} >= date_trunc('week', now()) then 1 else 0 end), 0)::int`,
        prevWeekBookings: sql<number>`coalesce(sum(case when ${bookings.createdAt} >= date_trunc('week', now()) - interval '7 days' and ${bookings.createdAt} < date_trunc('week', now()) then 1 else 0 end), 0)::int`,
        thisWeekRevenue: sql<number>`
          coalesce(sum(
            case when ${bookings.createdAt} >= date_trunc('week', now()) and ${bookings.status} = 'confirmed' then
              case
                when ${bookings.paymentStatus} = 'paid' then ${bookings.totalPrice}
                when ${bookings.paymentStatus} = 'dp' then coalesce(${bookings.dpAmount}, 0)
                else 0
              end
            else 0 end
          ), 0)::bigint
        `,
        prevWeekRevenue: sql<number>`
          coalesce(sum(
            case when ${bookings.createdAt} >= date_trunc('week', now()) - interval '7 days' and ${bookings.createdAt} < date_trunc('week', now()) and ${bookings.status} = 'confirmed' then
              case
                when ${bookings.paymentStatus} = 'paid' then ${bookings.totalPrice}
                when ${bookings.paymentStatus} = 'dp' then coalesce(${bookings.dpAmount}, 0)
                else 0
              end
            else 0 end
          ), 0)::bigint
        `,
      })
      .from(bookings);

    const [
      statusRows,
      [revenueRow],
      revenueByDateRows,
      trendRows,
      recent,
      [wowRow],
    ] = await Promise.all([
      statusRowsQuery,
      revenueQuery,
      revenueByDateQuery,
      trendQuery,
      recentQuery,
      wowQuery,
    ]);

    let total = 0;
    let pending = 0;
    let confirmed = 0;
    let cancelled = 0;
    for (const r of statusRows) {
      const c = Number(r.count);
      total += c;
      if (r.status === 'pending') pending = c;
      else if (r.status === 'confirmed') confirmed = c;
      else if (r.status === 'cancelled') cancelled = c;
    }

    const revenueByDate = revenueByDateRows
      .map((r) => ({ date: r.date, revenue: Number(r.revenue) }))
      .slice(-7);

    const trendMap = new Map(trendRows.map((r) => [r.date, Number(r.count)]));
    const weeklyTrend: { day: string; bookings: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
      weeklyTrend.push({ day: label, bookings: trendMap.get(key) || 0 });
    }

    return NextResponse.json({
      stats: {
        total,
        pending,
        confirmed,
        cancelled,
        revenue: Number(revenueRow?.revenue || 0),
        pendingRevenue: Number(revenueRow?.pendingRevenue || 0),
        dpCount: Number(revenueRow?.dpCount || 0),
        revenueByDate,
        weeklyTrend,
        recent,
        thisWeekBookings: Number(wowRow?.thisWeekBookings || 0),
        prevWeekBookings: Number(wowRow?.prevWeekBookings || 0),
        thisWeekRevenue: Number(wowRow?.thisWeekRevenue || 0),
        prevWeekRevenue: Number(wowRow?.prevWeekRevenue || 0),
      },
      usingDatabase: true,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to compute stats', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
