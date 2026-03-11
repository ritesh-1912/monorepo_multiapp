/**
 * Services CRUD. Owner only.
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

const createSchema = z.object({
  name: z.string().min(1).max(255),
  durationMinutes: z.number().int().positive(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isOwner(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const db = getDb();
  const list = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.userId, session!.user!.id));
  return NextResponse.json({ services: list });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !isOwner(session))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  const db = getDb();
  const [service] = await db
    .insert(schema.services)
    .values({
      userId: session.user.id,
      name: parsed.data.name,
      durationMinutes: parsed.data.durationMinutes,
    })
    .returning();
  return NextResponse.json({ service }, { status: 201 });
}
