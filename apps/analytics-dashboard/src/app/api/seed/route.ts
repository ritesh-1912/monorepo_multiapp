/**
 * POST /api/seed — generate sample events (revenue, signups, page_views) over last 90 days. Admin only.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const db = getDb();
  const now = new Date();
  const events: {
    eventName: string;
    timestamp: Date;
    value: number;
    dimensions: Record<string, string> | null;
  }[] = [];

  for (let d = 90; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    const dayKey = date.toISOString().slice(0, 10);

    // Revenue: random 500–5000 per day
    const revenue = Math.floor(500 + Math.random() * 4500);
    events.push({
      eventName: 'revenue',
      timestamp: new Date(dayKey + 'T12:00:00Z'),
      value: revenue,
      dimensions: null,
    });

    // Signups: random 10–80
    const signups = Math.floor(10 + Math.random() * 70);
    events.push({
      eventName: 'signups',
      timestamp: new Date(dayKey + 'T12:00:00Z'),
      value: signups,
      dimensions: null,
    });

    // Page views: random 100–2000, with dimension source
    const pageViews = Math.floor(100 + Math.random() * 1900);
    const sources = ['web', 'mobile', 'api'];
    const source = sources[d % 3];
    events.push({
      eventName: 'page_views',
      timestamp: new Date(dayKey + 'T12:00:00Z'),
      value: pageViews,
      dimensions: { source },
    });
  }

  await db.insert(schema.events).values(
    events.map((e) => ({
      eventName: e.eventName,
      timestamp: e.timestamp,
      value: e.value,
      dimensions: e.dimensions,
    }))
  );

  return NextResponse.json({ ok: true, count: events.length });
}
