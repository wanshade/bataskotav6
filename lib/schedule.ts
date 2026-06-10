// Single source of truth for schedule time slots and default pricing.
// Pricing can be overridden from the database (see /api/pricing).

export type ScheduleItem = {
  jam: string;
  harga: number;
};

export type ScheduleData = {
  [key: string]: ScheduleItem[];
};

// Day group keys used across the app
export const DAY_GROUPS = ['Senin_sd_Kamis', 'Jumat', 'Sabtu', 'Minggu'] as const;
export type DayGroup = (typeof DAY_GROUPS)[number];

// Human-friendly labels for the admin UI
export const DAY_GROUP_LABELS: Record<string, string> = {
  Senin_sd_Kamis: 'Senin - Kamis',
  Jumat: 'Jumat',
  Sabtu: 'Sabtu',
  Minggu: 'Minggu',
};

// Canonical list of time slots (same for every day group)
export const TIME_SLOTS = [
  '06.00 - 08.00',
  '08.00 - 10.00',
  '10.00 - 12.00',
  '12.00 - 14.00',
  '14.00 - 16.00',
  '16.00 - 18.00',
  '18.00 - 20.00',
  '20.00 - 22.00',
  '22.00 - 24.00',
] as const;

// Default pricing (used to seed the DB and as fallback if DB is unavailable)
export const DEFAULT_SCHEDULE: ScheduleData = {
  Senin_sd_Kamis: [
    { jam: '06.00 - 08.00', harga: 900000 },
    { jam: '08.00 - 10.00', harga: 900000 },
    { jam: '10.00 - 12.00', harga: 800000 },
    { jam: '12.00 - 14.00', harga: 800000 },
    { jam: '14.00 - 16.00', harga: 900000 },
    { jam: '16.00 - 18.00', harga: 1100000 },
    { jam: '18.00 - 20.00', harga: 1100000 },
    { jam: '20.00 - 22.00', harga: 1100000 },
    { jam: '22.00 - 24.00', harga: 1000000 },
  ],
  Jumat: [
    { jam: '06.00 - 08.00', harga: 900000 },
    { jam: '08.00 - 10.00', harga: 900000 },
    { jam: '10.00 - 12.00', harga: 700000 },
    { jam: '12.00 - 14.00', harga: 700000 },
    { jam: '14.00 - 16.00', harga: 900000 },
    { jam: '16.00 - 18.00', harga: 1200000 },
    { jam: '18.00 - 20.00', harga: 1200000 },
    { jam: '20.00 - 22.00', harga: 1200000 },
    { jam: '22.00 - 24.00', harga: 1000000 },
  ],
  Sabtu: [
    { jam: '06.00 - 08.00', harga: 1200000 },
    { jam: '08.00 - 10.00', harga: 1200000 },
    { jam: '10.00 - 12.00', harga: 900000 },
    { jam: '12.00 - 14.00', harga: 900000 },
    { jam: '14.00 - 16.00', harga: 900000 },
    { jam: '16.00 - 18.00', harga: 1200000 },
    { jam: '18.00 - 20.00', harga: 1200000 },
    { jam: '20.00 - 22.00', harga: 1200000 },
    { jam: '22.00 - 24.00', harga: 1000000 },
  ],
  Minggu: [
    { jam: '06.00 - 08.00', harga: 1200000 },
    { jam: '08.00 - 10.00', harga: 1200000 },
    { jam: '10.00 - 12.00', harga: 800000 },
    { jam: '12.00 - 14.00', harga: 800000 },
    { jam: '14.00 - 16.00', harga: 900000 },
    { jam: '16.00 - 18.00', harga: 1200000 },
    { jam: '18.00 - 20.00', harga: 1200000 },
    { jam: '20.00 - 22.00', harga: 1200000 },
    { jam: '22.00 - 24.00', harga: 1000000 },
  ],
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const getDayKey = (date: Date): string => {
  const day = date.getDay();
  if (day === 0) return 'Minggu';
  if (day === 5) return 'Jumat';
  if (day === 6) return 'Sabtu';
  return 'Senin_sd_Kamis';
};

export type ExpandedSlot = {
  start: number;
  end: number;
  label: string;
  price: number;
};

export const getExpandedSlots = (
  dayKey: string,
  schedule: ScheduleData = DEFAULT_SCHEDULE
): ExpandedSlot[] => {
  const raw = schedule[dayKey] || DEFAULT_SCHEDULE[dayKey] || [];
  const slots: ExpandedSlot[] = [];

  raw.forEach((item) => {
    const [startStr, endStr] = item.jam.split(' - ');
    const start = parseFloat(startStr.replace('.', '.'));
    const end = parseFloat(endStr.replace('.', '.'));
    slots.push({ start, end, label: item.jam, price: item.harga });
  });

  const uniqueMap = new Map<string, ExpandedSlot>();
  slots.forEach((slot) => uniqueMap.set(slot.label, slot));
  return Array.from(uniqueMap.values()).sort((a, b) => a.start - b.start);
};

export const parseTimeSlot = (slot: string) => {
  const [startStr, endStr] = slot.split(' - ');
  const start = parseFloat(startStr.replace('.', '.'));
  const end = parseFloat(endStr.replace('.', '.'));
  return { start, end };
};

export const hasTimeOverlap = (slot1: string, slot2: string): boolean => {
  const { start: s1, end: e1 } = parseTimeSlot(slot1);
  const { start: s2, end: e2 } = parseTimeSlot(slot2);
  return s1 < e2 && s2 < e1;
};

// Convert flat DB rows into the ScheduleData shape used by the UI.
// Falls back to defaults for any missing day/slot.
export const rowsToScheduleData = (
  rows: { dayGroup: string; timeSlot: string; price: number }[]
): ScheduleData => {
  const result: ScheduleData = {};

  for (const group of DAY_GROUPS) {
    result[group] = TIME_SLOTS.map((slot) => {
      const found = rows.find(
        (r) => r.dayGroup === group && r.timeSlot === slot
      );
      const fallback = DEFAULT_SCHEDULE[group].find((i) => i.jam === slot);
      return {
        jam: slot,
        harga: found ? found.price : fallback ? fallback.harga : 0,
      };
    });
  }

  return result;
};
