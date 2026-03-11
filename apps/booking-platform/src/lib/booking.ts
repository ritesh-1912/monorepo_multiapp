/**
 * Get booking by id for public confirmation page.
 */
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function getBookingById(id: string) {
  const db = getDb();
  const [booking] = await db.select().from(schema.bookings).where(eq(schema.bookings.id, id));
  if (!booking) return null;
  const [service] = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.id, booking.serviceId));
  const [staffMember] = await db
    .select()
    .from(schema.staff)
    .where(eq(schema.staff.id, booking.staffId));
  return {
    id: booking.id,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    startAt: booking.startAt,
    endAt: booking.endAt,
    status: booking.status,
    serviceName: service?.name,
    staffName: staffMember?.name,
  };
}
