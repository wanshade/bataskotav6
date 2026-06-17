import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';

// GET /api/admin/bookings/list?page=1&limit=20&status=pending&search=foo
// Server-side pagination + search + status filter, sorted by created_at DESC.
export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { bookings: [], total: 0, page: 1, limit: 20, totalPages: 0, usingDatabase: false },
      { status: 200 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const status = searchParams.get('status') || 'all';
    const search = (searchParams.get('search') || '').trim();
    // export=1 returns ALL matching rows (no pagination) for export features
    const isExport = searchParams.get('export') === '1';

    const { db } = await import('@/lib/db');
    const { bookings } = await import('@/lib/schema');
    const { and, or, eq, ilike, desc, sql } = await import('drizzle-orm');

    const conditions = [];
    if (status !== 'all') {
      conditions.push(eq(bookings.status, status));
    }
    if (search) {
      const pattern = `%${search}%`;
      conditions.push(
        or(
          ilike(bookings.teamName, pattern),
          ilike(bookings.bookingId, pattern),
          ilike(bookings.phone, pattern)
        )
      );
    }
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bookings)
      .where(whereClause);

    const total = Number(count);

    let query = db
      .select()
      .from(bookings)
      .where(whereClause)
      .orderBy(desc(bookings.createdAt))
      .$dynamic();

    if (!isExport) {
      query = query.limit(limit).offset((page - 1) * limit);
    }

    const rows = await query;

    return NextResponse.json({
      bookings: rows,
      total,
      page: isExport ? 1 : page,
      limit: isExport ? total : limit,
      totalPages: isExport ? 1 : Math.ceil(total / limit),
      usingDatabase: true,
    });
  } catch (error) {
    console.error('List bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to list bookings', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
