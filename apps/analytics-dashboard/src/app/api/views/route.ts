/**
 * GET /api/views — list saved views. POST /api/views — save view. Auth required.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const postSchema = z.object({
  name: z.string().min(1).max(255),
  filters: z.object({
    from: z.string(),
    to: z.string(),
    metric: z.string().optional(),
  }),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const views = await db
    .select()
    .from(schema.savedViews)
    .where(eq(schema.savedViews.userId, session.user.id));
  return NextResponse.json({ views });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

  const db = getDb();
  const [view] = await db
    .insert(schema.savedViews)
    .values({
      userId: session.user.id,
      name: parsed.data.name,
      filters: parsed.data.filters,
    })
    .returning();
  return NextResponse.json({ view }, { status: 201 });
}
