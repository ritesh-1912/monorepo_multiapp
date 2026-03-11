/**
 * Compute available time slots for a staff member on a date given weekly availability and existing bookings.
 */
import { getDb, schema } from '@/lib/db';
import { eq, and, gte, lt } from 'drizzle-orm';

export async function getAvailableSlots(
  staffId: string,
  date: Date,
  durationMinutes: number
): Promise<{ start: string; end: string }[]> {
  const db = getDb();
  const dayOfWeek = date.getDay(); // 0 Sun, 6 Sat

  const availabilityRows = await db
    .select()
    .from(schema.availability)
    .where(eq(schema.availability.staffId, staffId));

  const dayAvailability = availabilityRows.filter((a) => a.dayOfWeek === dayOfWeek);
  if (dayAvailability.length === 0) return [];

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const bookings = await db
    .select({ startAt: schema.bookings.startAt, endAt: schema.bookings.endAt })
    .from(schema.bookings)
    .where(
      and(
        eq(schema.bookings.staffId, staffId),
        eq(schema.bookings.status, 'confirmed'),
        gte(schema.bookings.startAt, dayStart),
        lt(schema.bookings.startAt, dayEnd)
      )
    );

  const slots: { start: Date; end: Date }[] = [];

  for (const av of dayAvailability) {
    const [startH, startM] = av.startTime.split(':').map(Number);
    const [endH, endM] = av.endTime.split(':').map(Number);
    let slotStart = new Date(date);
    slotStart.setHours(startH, startM, 0, 0);
    const slotEndLimit = new Date(date);
    slotEndLimit.setHours(endH, endM, 0, 0);

    while (slotStart.getTime() + durationMinutes * 60 * 1000 <= slotEndLimit.getTime()) {
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
      const overlaps = bookings.some(
        (b) => slotStart < new Date(b.endAt!) && slotEnd > new Date(b.startAt!)
      );
      if (!overlaps) slots.push({ start: new Date(slotStart), end: slotEnd });
      slotStart = new Date(slotStart.getTime() + 30 * 60 * 1000); // next slot every 30 min
    }
  }

  return slots.map((s) => ({
    start: s.start.toISOString(),
    end: s.end.toISOString(),
  }));
}
