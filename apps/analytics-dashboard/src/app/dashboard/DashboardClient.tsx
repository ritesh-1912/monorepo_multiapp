'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
} from '@repo/ui';
import { useToast } from '@repo/ui/toast';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';

type Kpis = { total: number; count: number };
type TimeSeriesPoint = { date: string; total: number };
type AggregatedRow = { date: string; eventName: string; total: number; count: number };
type EventRow = {
  id: string;
  eventName: string;
  timestamp: string;
  value: number;
  dimensions: unknown;
};

const SEGMENTS = [
  { key: '1D', label: '1D' },
  { key: '7D', label: '7D' },
  { key: '30D', label: '30D' },
  { key: '90D', label: '90D' },
];

export function DashboardClient({
  defaultFrom,
  defaultTo,
  isAdmin,
}: {
  defaultFrom: string;
  defaultTo: string;
  isAdmin: boolean;
}) {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [segment, setSegment] = useState('30D');
  const [metric, setMetric] = useState<string>('');
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [aggregated, setAggregated] = useState<AggregatedRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingView, setSavingView] = useState(false);
  const [viewName, setViewName] = useState('');
  const { toast } = useToast();

  const fetchMetrics = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ from, to });
    if (metric) params.set('metric', metric);
    fetch(`/api/metrics?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setKpis(d.kpis ?? { total: 0, count: 0 });
        setTimeSeries(Array.isArray(d.timeSeries) ? d.timeSeries : []);
        setAggregated(Array.isArray(d.aggregated) ? d.aggregated : []);
      })
      .catch(() => {
        setKpis({ total: 0, count: 0 });
        setTimeSeries([]);
        setAggregated([]);
      })
      .finally(() => setLoading(false));
  }, [from, to, metric]);

  const fetchEvents = useCallback(() => {
    const params = new URLSearchParams({ from, to, limit: '10' });
    if (metric) params.set('metric', metric);
    fetch(`/api/events?${params}`)
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => setEvents([]));
  }, [from, to, metric]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  function handleSaveView() {
    if (!viewName.trim()) return;
    setSavingView(true);
    fetch('/api/views', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: viewName.trim(),
        filters: { from, to, metric: metric || undefined },
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed');
        toast('View saved', 'success');
        setViewName('');
      })
      .catch(() => toast('Failed to save view', 'error'))
      .finally(() => setSavingView(false));
  }

  function handleExport() {
    const params = new URLSearchParams({ from, to, format: 'csv' });
    window.open(`/api/export?${params}`, '_blank');
  }

  const chartData = timeSeries.map((d) => ({ ...d, date: d.date?.slice(0, 10) ?? d.date }));
  const barData = aggregated.reduce((acc: { eventName: string; total: number }[], row) => {
    const existing = acc.find((x) => x.eventName === row.eventName);
    if (existing) existing.total += Number(row.total);
    else acc.push({ eventName: row.eventName, total: Number(row.total) });
    return acc;
  }, []);

  const metricCards = [
    {
      label: 'Total revenue',
      value: kpis?.total ?? 0,
      accent: true,
      sub: 'Primary metric',
    },
    { label: 'Active users', value: kpis?.count ?? 0, accent: false, sub: 'Events' },
    {
      label: 'Avg. session',
      value: kpis?.count ? Math.round((kpis.total / kpis.count) * 100) / 100 : 0,
      accent: false,
      sub: 'Value per event',
    },
    {
      label: 'Conversion rate',
      value: kpis?.count ? Math.min(100, Math.round(kpis.count / 10)) : 0,
      accent: false,
      sub: '%',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top bar: title left, date + export right */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium tracking-heading text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Metrics, time series, and event data.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 w-[140px]"
            />
            <span className="text-muted-foreground">→</span>
            <Input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-10 w-[140px]"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            Export
          </Button>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Save view..."
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              className="h-10 w-36"
            />
            <Button size="sm" onClick={handleSaveView} loading={savingView}>
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Filters row */}
      <Card className="border-border bg-surface p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Metric</Label>
            <Select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="mt-1.5 h-10 w-36"
            >
              <option value="">All</option>
              <option value="revenue">Revenue</option>
              <option value="signups">Signups</option>
              <option value="page_views">Page views</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Metric cards: 4 across, display font 48px, first with accent */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-md" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((card) => (
            <Card
              key={card.label}
              className="overflow-hidden border-border bg-surface transition-shadow duration-normal hover:shadow-card-hover"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <CardContent className="flex min-h-[120px] flex-col justify-between p-6 pt-6">
                <div>
                  <p className="text-xs font-medium uppercase leading-tight tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                  <p
                    className="mt-2 font-display text-3xl font-medium tabular-nums leading-none tracking-heading"
                    style={{
                      color: card.accent ? 'var(--accent)' : 'var(--foreground)',
                    }}
                  >
                    {card.value}
                  </p>
                </div>
                <p className="mt-3 text-xs leading-tight text-muted-foreground">{card.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main chart: area with gradient, segmented control */}
      <Card className="border-border bg-surface" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="font-display text-lg font-medium tracking-heading">
            Revenue over time
          </CardTitle>
          <div className="flex rounded-md bg-surface-hover p-1" role="tablist">
            {SEGMENTS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSegment(s.key)}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-all duration-normal ${
                  segment === s.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <CardContent className="p-6 pt-4">
          {chartData.length === 0 && !loading ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-foreground">No data yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isAdmin
                  ? 'Seed demo data from Settings → Seed data, then refresh.'
                  : 'Ask an admin to seed demo data, then refresh.'}
              </p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c6f04c" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#c6f04c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    tickLine={false}
                    tickFormatter={(v) => String(v)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#c6f04c"
                    strokeWidth={2}
                    fill="url(#chartGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Secondary row: bar 60%, donut placeholder 40% */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card
          className="border-border bg-surface lg:col-span-3"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base font-medium tracking-heading">
              By metric (aggregated)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length === 0 && !loading ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No data.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                    <XAxis
                      dataKey="eventName"
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a1a',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="total" fill="rgba(198,240,76,0.6)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        <Card
          className="border-border bg-surface lg:col-span-2"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base font-medium tracking-heading">
              Event breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length === 0 && !loading ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No data.</p>
            ) : (
              <ul className="space-y-2">
                {barData.slice(0, 5).map((r) => (
                  <li
                    key={r.eventName}
                    className="flex items-center justify-between rounded-md px-3 py-2 transition-colors duration-fast hover:bg-surface-hover"
                  >
                    <span className="text-sm text-foreground">{r.eventName}</span>
                    <span className="text-xs text-muted-foreground">{r.total}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data table: sticky header, zebra */}
      <Card
        className="overflow-hidden border-border bg-surface"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <CardHeader className="border-b border-border">
          <CardTitle className="font-display text-base font-medium tracking-heading">
            Recent events
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {events.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No events.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-surface hover:bg-surface">
                    <TableHead className="sticky top-0 z-10 border-b border-border bg-surface py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Event
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 border-b border-border bg-surface py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Timestamp
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 border-b border-border bg-surface py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Value
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 border-b border-border bg-surface py-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Dimensions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((e, i) => (
                    <TableRow
                      key={e.id}
                      className="border-border transition-colors duration-fast hover:bg-[rgba(255,255,255,0.03)]"
                      style={{
                        backgroundColor: i % 2 === 1 ? 'rgba(255,255,255,0.04)' : undefined,
                      }}
                    >
                      <TableCell className="py-3 font-medium">{e.eventName}</TableCell>
                      <TableCell className="py-3 text-sm text-muted-foreground">
                        {e.timestamp ? new Date(e.timestamp).toLocaleString() : '—'}
                      </TableCell>
                      <TableCell className="py-3">{e.value}</TableCell>
                      <TableCell className="max-w-[200px] truncate py-3 text-sm text-muted-foreground">
                        {e.dimensions ? JSON.stringify(e.dimensions) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {isAdmin && (
        <Card className="border-border bg-surface">
          <CardContent className="p-6">
            <Link href="/dashboard/settings">
              <Button variant="outline">Manage API keys (admin)</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
