import { NextResponse } from 'next/server';
import { DEFAULT_SCHEDULE, rowsToScheduleData } from '@/lib/schedule';

// Public endpoint: returns current pricing as ScheduleData.
// Falls back to DEFAULT_SCHEDULE if the DB is unavailable or empty.
export async function GET() {
  try {
    const hasDatabaseConfigured = !!process.env.DATABASE_URL;

    if (hasDatabaseConfigured) {
      try {
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
      } catch (dbError) {
        console.error('Pricing DB error, falling back to defaults:', dbError);
      }
    }

    // Fallback
    return NextResponse.json({ schedule: DEFAULT_SCHEDULE });
  } catch (error) {
    console.error('Get pricing error:', error);
    return NextResponse.json({ schedule: DEFAULT_SCHEDULE });
  }
}
