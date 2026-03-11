/**
 * Metrics aggregation: time series and breakdown from events table.
 */
import { getDb, schema } from '@/lib/db';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

export async function getAggregatedMetrics(params: { from: Date; to: Date; metric?: string }) {
  const db = getDb();
  const { from, to, metric } = params;
  const conditions = [gte(schema.events.timestamp, from), lte(schema.events.timestamp, to)];
  if (metric) conditions.push(eq(schema.events.eventName, metric));

  const rows = await db
    .select({
      date: sql<string>`date_trunc('day', ${schema.events.timestamp})::date`,
      eventName: schema.events.eventName,
      total: sql<number>`COALESCE(SUM(${schema.events.value}), 0)::int`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(schema.events)
    .where(and(...conditions))
    .groupBy(sql`date_trunc('day', ${schema.events.timestamp})::date`, schema.events.eventName)
    .orderBy(sql`date_trunc('day', ${schema.events.timestamp})::date`);

  return rows;
}

export async function getTimeSeries(params: { from: Date; to: Date; metric: string }) {
  const db = getDb();
  const rows = await db
    .select({
      date: sql<string>`date_trunc('day', ${schema.events.timestamp})::date`,
      total: sql<number>`COALESCE(SUM(${schema.events.value}), 0)::int`,
    })
    .from(schema.events)
    .where(
      and(
        gte(schema.events.timestamp, params.from),
        lte(schema.events.timestamp, params.to),
        eq(schema.events.eventName, params.metric)
      )
    )
    .groupBy(sql`date_trunc('day', ${schema.events.timestamp})::date`)
    .orderBy(sql`date_trunc('day', ${schema.events.timestamp})::date`);

  return rows;
}

export async function getKpis(params: { from: Date; to: Date; metric?: string }) {
  const db = getDb();
  const conditions = [
    gte(schema.events.timestamp, params.from),
    lte(schema.events.timestamp, params.to),
  ];
  if (params.metric) {
    conditions.push(eq(schema.events.eventName, params.metric));
  }

  const [row] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${schema.events.value}), 0)::int`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(schema.events)
    .where(and(...conditions));

  return { total: row?.total ?? 0, count: row?.count ?? 0 };
}
