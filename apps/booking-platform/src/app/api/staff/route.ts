/**
 * Staff CRUD. Owner only.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

function isOwner(session: { user?: { role?: string } } | null) {
  return session?.user?.role === 'owner';
}

const createSchema = z.object({ name: z.string().min(1).max(255) });

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isOwner(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  const list = await db
    .select()
    .from(schema.staff)
    .where(eq(schema.staff.userId, session!.user!.id));
  return NextResponse.json({ staff: list });
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
    .insert(schema.staff)
    .values({ userId: session.user.id, name: parsed.data.name })
    .returning();
  return NextResponse.json({ staff: staffMember }, { status: 201 });
}
