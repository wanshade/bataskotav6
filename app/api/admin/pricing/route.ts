import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import {
  DAY_GROUPS,
  TIME_SLOTS,
  DEFAULT_SCHEDULE,
  rowsToScheduleData,
} from '@/lib/schedule';

// GET: admin reads current pricing (same shape as public, but auth-gated copy
// useful for the admin editor).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !['admin', 'superadmin'].includes(session.user?.role ?? '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (process.env.DATABASE_URL) {
      const { db } = await import('@/lib/db');
      const { pricing } = await import('@/lib/schema');
      const rows = await db.select().from(pricing);
      if (rows.length > 0) {
        const schedule = rowsToScheduleData(
          rows.map((r) => ({
            dayGroup: r.dayGroup,
            timeSlot: r.timeSlot,
            price: r.price,
          }))
        );
        return NextResponse.json({ schedule });
      }
    }
    return NextResponse.json({ schedule: DEFAULT_SCHEDULE });
  } catch (error) {
    console.error('Admin get pricing error:', error);
    return NextResponse.json({ schedule: DEFAULT_SCHEDULE });
  }
}

// PUT: admin updates pricing. Accepts a list of { dayGroup, timeSlot, price }.
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !['admin', 'superadmin'].includes(session.user?.role ?? '')) {
    return NextResponse.json(
      { error: 'Unauthorized - Admin access required' },
      { status: 401 }
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: 'Database not configured. Cannot update pricing.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const updates: { dayGroup: string; timeSlot: string; price: number }[] =
      body.updates;

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    // Validate each update
    for (const u of updates) {
      if (
        !DAY_GROUPS.includes(u.dayGroup as (typeof DAY_GROUPS)[number]) ||
        !TIME_SLOTS.includes(u.timeSlot as (typeof TIME_SLOTS)[number])
      ) {
        return NextResponse.json(
          { error: `Invalid day group or time slot: ${u.dayGroup} / ${u.timeSlot}` },
          { status: 400 }
        );
      }
      const priceNum =
        typeof u.price === 'string'
          ? parseInt((u.price as string).replace(/\D/g, ''))
          : u.price;
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        return NextResponse.json(
          { error: `Invalid price for ${u.dayGroup} ${u.timeSlot}` },
          { status: 400 }
        );
      }
      u.price = priceNum;
    }

    const { db } = await import('@/lib/db');
    const { pricing } = await import('@/lib/schema');
    const { and, eq } = await import('drizzle-orm');

    for (const u of updates) {
      // Upsert: update if exists, else insert
      const existing = await db
        .select()
        .from(pricing)
        .where(
          and(eq(pricing.dayGroup, u.dayGroup), eq(pricing.timeSlot, u.timeSlot))
        );

      if (existing.length > 0) {
        await db
          .update(pricing)
          .set({ price: u.price, updatedAt: new Date() })
          .where(
            and(
              eq(pricing.dayGroup, u.dayGroup),
              eq(pricing.timeSlot, u.timeSlot)
            )
          );
      } else {
        await db.insert(pricing).values({
          dayGroup: u.dayGroup,
          timeSlot: u.timeSlot,
          price: u.price,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} price(s)`,
    });
  } catch (error) {
    console.error('Update pricing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update pricing',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
