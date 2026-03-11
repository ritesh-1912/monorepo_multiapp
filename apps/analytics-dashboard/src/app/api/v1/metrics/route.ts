/**
 * GET /api/v1/metrics?from=&to=&metric= — public API. Requires Authorization: Bearer <api_key>.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateKey } from '@/lib/api-key';
import { getAggregatedMetrics, getKpis } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  from: z.string(),
  to: z.string(),
  metric: z.string().optional(),
});

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    return NextResponse.json({ error: 'Missing Authorization: Bearer <api_key>' }, { status: 401 });
  }

  const userId = await validateKey(token);
  if (!userId) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    metric: searchParams.get('metric') ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
  }

  const from = new Date(parsed.data.from);
  const to = new Date(parsed.data.to);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
  }

  const [kpis, aggregated] = await Promise.all([
    getKpis({ from, to, metric: parsed.data.metric }),
    getAggregatedMetrics({ from, to, metric: parsed.data.metric }),
  ]);

  return NextResponse.json({
    from: parsed.data.from,
    to: parsed.data.to,
    metric: parsed.data.metric ?? 'all',
    kpis,
    data: aggregated,
  });
}
