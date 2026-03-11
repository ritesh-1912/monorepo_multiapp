/**
 * Analytics dashboard landing. Readable dark theme, clean demo card.
 */
'use client';

import Link from 'next/link';
import { Button } from '@repo/ui';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
          <span className="font-display text-xl font-medium tracking-heading text-foreground">
            Signal
          </span>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/dashboard"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <Link href="/register">
              <Button size="sm">Start free</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero + demo */}
      <main className="mx-auto max-w-content px-6 py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <section className="space-y-6">
            <p className="text-sm font-medium text-muted-foreground">
              Analytics for modern SaaS teams
            </p>
            <h1 className="font-display text-3xl font-medium tracking-heading text-foreground sm:text-4xl lg:text-5xl">
              See your product’s health at a glance.
            </h1>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Track signups, revenue, and engagement in one place. Dashboards, exportable reports,
              and a clean API.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/register">
                <Button size="lg">Get started free</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg">
                  View sample
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card · Works with your existing stack
            </p>
          </section>

          {/* Live demo card — clean, readable */}
          <section className="lg:max-w-md">
            <div
              className="overflow-hidden rounded-xl border border-border bg-surface"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <span className="text-sm font-medium text-foreground">Live demo</span>
                <span className="text-xs text-muted-foreground">Last 30 days</span>
              </div>
              <div className="grid grid-cols-3 gap-px bg-border">
                <div className="bg-surface px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    MRR
                  </p>
                  <p className="mt-1 font-display text-xl font-medium text-foreground">$24,800</p>
                  <p className="mt-0.5 text-xs text-[#86efac]">+18%</p>
                </div>
                <div className="bg-surface px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Users
                  </p>
                  <p className="mt-1 font-display text-xl font-medium text-foreground">1,942</p>
                  <p className="mt-0.5 text-xs text-[#86efac]">+320 new</p>
                </div>
                <div className="bg-surface px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Churn
                  </p>
                  <p className="mt-1 font-display text-xl font-medium text-foreground">2.1%</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Stable</p>
                </div>
              </div>
              <div className="border-t border-border bg-surface-hover px-5 py-5">
                <div className="rounded-lg border border-border bg-background/40 p-3">
                  <div className="flex items-end justify-between gap-1.5">
                    {[8, 12, 10, 16, 14, 18, 15, 20, 17, 22, 19, 24].map((h, i) => (
                      <div
                        key={i}
                        className="w-full rounded-sm"
                        style={{
                          height: `${h}px`,
                          background:
                            'linear-gradient(180deg, rgba(198,240,76,0.95), rgba(198,240,76,0.15))',
                          boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset',
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Revenue trend</span>
                    <span className="tabular-nums">30d</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
