import { pgTable, serial, text, timestamp, integer, boolean, index } from 'drizzle-orm/pg-core';

// Function to generate random booking ID (e.g., BK-20231124-A1B2)
function generateBookingId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${date}-${random}`;
}

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  bookingId: text('booking_id').notNull().unique(), // Unique booking ID like BK-20231124-A1B2
  teamName: text('team_name').notNull(),
  phone: text('phone').notNull(),
  bookingDate: text('booking_date').notNull(), // Store as formatted string
  timeSlot: text('time_slot').notNull(),
  price: integer('price').notNull(), // Store in cents/smallest unit
  totalPrice: integer('total_price').notNull(), // Total price that should be paid
  paymentStatus: text('payment_status').default('pending').notNull(), // pending, dp, paid
  dpAmount: integer('dp_amount'), // DP amount paid (if paymentStatus is 'dp')
  createdAt: timestamp('created_at').defaultNow().notNull(),
  status: text('status').default('pending').notNull(), // pending, confirmed, cancelled
  approvedAt: timestamp('approved_at'), // When admin approved the booking
  approvedBy: text('approved_by'), // Admin who approved it
  addDokumentasi: boolean('add_dokumentasi').default(false),
  addWasit: boolean('add_wasit').default(false),
}, (table) => ({
  statusIdx: index('bookings_status_idx').on(table.status),
  createdAtIdx: index('bookings_created_at_idx').on(table.createdAt),
  bookingDateIdx: index('bookings_booking_date_idx').on(table.bookingDate),
  teamNameIdx: index('bookings_team_name_idx').on(table.teamName),
}));

// Pricing per day group + time slot (editable from admin dashboard)
export const pricing = pgTable('pricing', {
  id: serial('id').primaryKey(),
  dayGroup: text('day_group').notNull(), // e.g. Senin_sd_Kamis, Jumat, Sabtu, Minggu
  timeSlot: text('time_slot').notNull(), // e.g. "06.00 - 08.00"
  price: integer('price').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Pricing = typeof pricing.$inferSelect;
export type NewPricing = typeof pricing.$inferInsert;

export { generateBookingId };
