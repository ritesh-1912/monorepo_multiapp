/**
 * Saved views list. Fetches from API; load view redirects to dashboard with query params.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

type View = { id: string; name: string; filters: { from?: string; to?: string; metric?: string } };

export default function ViewsPage() {
  const router = useRouter();
  const [views, setViews] = useState<View[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/views')
      .then((r) => {
        if (r.status === 401) {
          router.replace('/login');
          return [];
        }
        return r.json();
      })
      .then((d) => setViews(d.views ?? []))
      .catch(() => setViews([]))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Saved views</h1>
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Saved views</h1>
        <p className="text-muted-foreground">Load a view to apply its filters on the dashboard.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your views</CardTitle>
        </CardHeader>
        <CardContent>
          {views.length === 0 ? (
            <p className="text-muted-foreground">
              No saved views. Save one from the dashboard filters.
            </p>
          ) : (
            <ul className="space-y-2">
              {views.map((v) => {
                const f = v.filters ?? {};
                const q = new URLSearchParams({ from: f.from ?? '', to: f.to ?? '' });
                if (f.metric) q.set('metric', f.metric);
                return (
                  <li
                    key={v.id}
                    className="flex items-center justify-between rounded border border-border px-3 py-2"
                  >
                    <span className="font-medium">{v.name}</span>
                    <button
                      type="button"
                      onClick={() => router.push(`/dashboard?${q.toString()}`)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Load
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
