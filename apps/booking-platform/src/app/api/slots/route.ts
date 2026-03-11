/**
 * GET /api/slots?serviceId=&staffId=&date=  — available slots for a service/staff/date.
 */
import { NextResponse } from 'next/server';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getAvailableSlots } from '@/lib/slots';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get('serviceId');
  const staffId = searchParams.get('staffId');
  const dateStr = searchParams.get('date');

  if (!serviceId || !staffId || !dateStr) {
    return NextResponse.json({ error: 'Missing serviceId, staffId, or date' }, { status: 400 });
  }

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  const db = getDb();
  const [service] = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.id, serviceId));
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

  const [staffMember] = await db.select().from(schema.staff).where(eq(schema.staff.id, staffId));
  if (!staffMember) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });

  const slots = await getAvailableSlots(staffId, date, service.durationMinutes);
  return NextResponse.json({ slots });
}
