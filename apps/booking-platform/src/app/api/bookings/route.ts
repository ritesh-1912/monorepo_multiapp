/**
 * GET /api/bookings — owner list. POST /api/bookings — create booking (public or owner).
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getAvailableSlots } from '@/lib/slots';

const createSchema = z.object({
  serviceId: z.string().uuid(),
  staffId: z.string().uuid(),
  startAt: z.string(), // ISO
  customerName: z.string().min(1).max(255),
  customerEmail: z.string().email(),
  notes: z.string().max(1000).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'owner') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const db = getDb();
  const staffList = await db
    .select()
    .from(schema.staff)
    .where(eq(schema.staff.userId, session.user.id));
  const staffIds = staffList.map((s) => s.id);
  const bookings = await db.select().from(schema.bookings);
  const forOwner = bookings.filter((b) => staffIds.includes(b.staffId));
  return NextResponse.json({ bookings: forOwner });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const { serviceId, staffId, startAt, customerName, customerEmail, notes } = parsed.data;
  const start = new Date(startAt);
  if (Number.isNaN(start.getTime()))
    return NextResponse.json({ error: 'Invalid startAt' }, { status: 400 });

  const db = getDb();
  const [service] = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.id, serviceId));
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });
  const [staffMember] = await db.select().from(schema.staff).where(eq(schema.staff.id, staffId));
  if (!staffMember) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });

  const slots = await getAvailableSlots(staffId, start, service.durationMinutes);
  const slotMatch = slots.find((s) => new Date(s.start).getTime() === start.getTime());
  if (!slotMatch) return NextResponse.json({ error: 'Slot no longer available' }, { status: 409 });

  const end = new Date(start.getTime() + service.durationMinutes * 60 * 1000);

  const [booking] = await db
    .insert(schema.bookings)
    .values({
      serviceId,
      staffId,
      customerName,
      customerEmail,
      startAt: start,
      endAt: end,
      notes: notes ?? null,
    })
    .returning();

  return NextResponse.json({ booking }, { status: 201 });
}
