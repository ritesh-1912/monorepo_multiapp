'use client';

import Link from 'next/link';
import { Button } from '@repo/ui';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
          <Link
            href="/"
            className="font-display text-xl font-medium tracking-heading text-foreground"
          >
            Calenflow
          </Link>
          <nav className="flex items-center gap-8 text-sm">
            <Link
              href="/book"
              className="text-muted-foreground transition-colors duration-fast hover:text-foreground"
            >
              Book a meeting
            </Link>
            <Link
              href="/login"
              className="text-muted-foreground transition-colors duration-fast hover:text-foreground"
            >
              Log in
            </Link>
          </nav>
          <Link href="/register">
            <Button size="sm" className="bg-primary text-primary-foreground">
              Get started
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-content px-6 py-24">
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-4xl font-normal tracking-heading text-foreground sm:text-5xl sm:leading-[1.1]">
            Find your perfect
            <br />
            <span className="text-foreground">appointment.</span>
          </h1>
          <p className="mt-6 text-base text-muted-foreground sm:text-lg">
            Share a single link. Clients pick a time that works. Time zones, buffers, and reminders
            built in.
          </p>

          {/* Search bar: single row, inputs + Search button same height and container */}
          <div
            className="mt-10 flex flex-col overflow-hidden rounded-xl border border-border bg-surface sm:flex-row sm:rounded-full"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex flex-1 flex-col sm:flex-row sm:items-stretch">
              <input
                type="text"
                placeholder="Location"
                className="min-h-[48px] flex-1 border-0 bg-transparent px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 sm:border-r sm:border-border"
              />
              <input
                type="date"
                placeholder="Date"
                className="min-h-[48px] flex-1 border-0 bg-transparent px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none sm:border-r sm:border-border"
              />
              <input
                type="text"
                placeholder="Guests"
                className="min-h-[48px] flex-1 border-0 bg-transparent px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none sm:border-0"
              />
            </div>
            <Link
              href="/book"
              className="flex shrink-0 items-center justify-center border-t border-border bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:min-h-[48px] sm:border-l sm:border-t-0 sm:px-8"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Search
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            No credit card required · Owner dashboard included
          </p>
        </section>

        <section className="mt-24 flex justify-center">
          <div
            className="grid w-full max-w-2xl grid-cols-7 gap-2 rounded-xl border border-border bg-surface p-6"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div
                key={d}
                className="rounded-md border border-border/60 py-2 text-center text-xs text-muted-foreground"
              >
                {d}
              </div>
            ))}
            <div className="col-span-7 mt-4 rounded-lg border border-border/60 bg-muted/50 px-4 py-3 text-sm text-foreground">
              Product demo · 30 min — 3 slots today
            </div>
            <div className="col-span-7 rounded-lg border border-border/60 bg-muted/50 px-4 py-3 text-sm text-foreground">
              Onboarding call · 45 min — Next: tomorrow
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
