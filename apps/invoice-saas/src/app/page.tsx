/**
 * Landing page: hero, value props, and CTA. Readable typography.
 */
'use client';

import Link from 'next/link';
import { Button, Card, CardContent } from '@repo/ui';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
          <span className="text-xl font-semibold tracking-tight text-foreground">Ledgerly</span>
          <nav className="flex items-center gap-6 text-base">
            <Link
              href="/login"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <Link href="/register">
              <Button size="md">Start free</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex max-w-content flex-col gap-16 px-6 py-16 lg:flex-row lg:items-center">
        <section className="flex-1 space-y-6">
          <p className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-muted-foreground">
            Trusted-style invoicing experience for your clients
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Send polished invoices
            <br className="hidden sm:inline" /> and get paid faster.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            Craft invoices that feel as professional as your work. Share a secure payment link,
            track status, and keep everything in one simple dashboard.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/register">
              <Button size="lg">Create your first invoice</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                View demo dashboard
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            No credit card required · Works with Stripe / Razorpay
          </p>
        </section>

        <section className="flex-1">
          <Card className="border-border bg-surface" style={{ boxShadow: 'var(--shadow-card)' }}>
            <CardContent className="p-6">
              <p className="text-base font-medium text-muted-foreground">Invoice preview</p>
              <div className="mt-5 rounded-xl border border-border bg-card/90 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-card-foreground">Acme Studio</p>
                    <p className="text-sm text-muted-foreground">Design retainer · May</p>
                  </div>
                  <span className="rounded-md bg-amber-500/15 px-3 py-1.5 text-sm font-medium text-amber-400">
                    Due in 7 days
                  </span>
                </div>
                <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Brand identity concept</span>
                    <span>$1,800.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Website layout</span>
                    <span>$3,200.00</span>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-base">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold text-foreground">$5,000.00</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
