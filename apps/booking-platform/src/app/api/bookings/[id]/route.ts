/**
 * GET /api/bookings/[id] — public confirmation view (no auth). Returns limited booking + service + staff names.
 */
import { NextResponse } from 'next/server';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const db = getDb();
  const [booking] = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, params.id));
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [service] = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.id, booking.serviceId));
  const [staffMember] = await db
    .select()
    .from(schema.staff)
    .where(eq(schema.staff.id, booking.staffId));

  return NextResponse.json({
    id: booking.id,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    startAt: booking.startAt,
    endAt: booking.endAt,
    status: booking.status,
    serviceName: service?.name,
    staffName: staffMember?.name,
  });
}
