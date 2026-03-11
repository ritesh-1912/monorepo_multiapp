/**
 * Availability CRUD. Owner only. Repeating weekly slots per staff.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { eq, inArray } from 'drizzle-orm';

function isOwner(session: { user?: { role?: string } } | null) {
  return session?.user?.role === 'owner';
}

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const createSchema = z.object({
  staffId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex),
  endTime: z.string().regex(timeRegex),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!isOwner(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { searchParams } = new URL(request.url);
  const staffId = searchParams.get('staffId');
  const db = getDb();
  const staffList = await db
    .select()
    .from(schema.staff)
    .where(eq(schema.staff.userId, session!.user!.id));
  const staffIds = new Set(staffList.map((s) => s.id));
  if (staffId && !staffIds.has(staffId))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const list = staffId
    ? await db.select().from(schema.availability).where(eq(schema.availability.staffId, staffId))
    : await db
        .select()
        .from(schema.availability)
        .where(inArray(schema.availability.staffId, Array.from(staffIds)));
  return NextResponse.json({ availability: list });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isOwner(session))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  const db = getDb();
  const [staffMember] = await db
    .select()
    .from(schema.staff)
    .where(eq(schema.staff.id, parsed.data.staffId));
  if (!staffMember || staffMember.userId !== session.user.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const [row] = await db
    .insert(schema.availability)
    .values({
      staffId: parsed.data.staffId,
      dayOfWeek: parsed.data.dayOfWeek,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
    })
    .returning();
  return NextResponse.json({ availability: row }, { status: 201 });
}
