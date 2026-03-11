/**
 * GET /api/metrics?from=&to=&metric= — aggregated metrics (KPIs + time series). Auth required.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { getAggregatedMetrics, getKpis, getTimeSeries } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  from: z.string(),
  to: z.string(),
  metric: z.string().optional(),
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
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const from = new Date(parsed.data.from);
  const to = new Date(parsed.data.to);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
  }

  const [aggregated, kpis, timeSeriesRevenue] = await Promise.all([
    getAggregatedMetrics({ from, to, metric: parsed.data.metric }),
    getKpis({ from, to, metric: parsed.data.metric }),
    getTimeSeries({ from, to, metric: 'revenue' }),
  ]);

  return NextResponse.json({
    kpis,
    aggregated,
    timeSeries: timeSeriesRevenue,
  });
}
