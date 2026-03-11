/**
 * GET /api/export?from=&to=&format=csv — export events as CSV. Auth required.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { and, gte, lte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  from: z.string(),
  to: z.string(),
  format: z.enum(['csv']).default('csv'),
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
    format: searchParams.get('format') ?? 'csv',
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
  const events = await db
    .select()
    .from(schema.events)
    .where(and(gte(schema.events.timestamp, from), lte(schema.events.timestamp, to)));

  const headers = ['id', 'eventName', 'timestamp', 'value', 'dimensions'];
  const rows = events.map((e) => [
    e.id,
    e.eventName,
    e.timestamp?.toISOString() ?? '',
    e.value,
    typeof e.dimensions === 'object' ? JSON.stringify(e.dimensions) : '',
  ]);
  const csv = [
    headers.join(','),
    ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="export-${from.toISOString().slice(0, 10)}-${to.toISOString().slice(0, 10)}.csv"`,
    },
  });
}
