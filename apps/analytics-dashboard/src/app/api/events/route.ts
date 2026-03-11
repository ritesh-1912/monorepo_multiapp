/**
 * GET /api/events?from=&to=&metric=&page=&limit= — raw events for table. Auth required.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { and, gte, lte, eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  from: z.string(),
  to: z.string(),
  metric: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    metric: searchParams.get('metric') ?? undefined,
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
  }

  const from = new Date(parsed.data.from);
  const to = new Date(parsed.data.to);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
  }

  const db = getDb();
  const conditions = [gte(schema.events.timestamp, from), lte(schema.events.timestamp, to)];
  if (parsed.data.metric) conditions.push(eq(schema.events.eventName, parsed.data.metric));

  const offset = (parsed.data.page - 1) * parsed.data.limit;
  const events = await db
    .select()
    .from(schema.events)
    .where(and(...conditions))
    .orderBy(desc(schema.events.timestamp))
    .limit(parsed.data.limit)
    .offset(offset);

  const allInRange = await db
    .select({ id: schema.events.id })
    .from(schema.events)
    .where(and(...conditions));

  return NextResponse.json({
    events,
    total: allInRange.length,
    page: parsed.data.page,
    limit: parsed.data.limit,
  });
}
