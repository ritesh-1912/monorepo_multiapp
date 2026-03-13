# Portfolio Full-Stack Monorepo

A monorepo with three production-ready full-stack apps and a shared UI package. Built for portfolio demos and freelancing (Fiverr, Upwork).

| App | Purpose | Port |
|-----|---------|------|
| **invoice-saas** | Invoicing: create/send invoices, Razorpay payments, public invoice page | 3000 |
| **booking-platform** | Appointments: services, staff, availability, public booking flow | 3001 |
| **analytics-dashboard** | Metrics: KPIs, charts, saved views, API keys, OpenAPI docs | 3002 |

## Quick Start

```bash
# Install dependencies
npm install

# Build shared UI
npm run build -w @repo/ui

# Start local database (Docker required)
npm run db:up
npm run db:setup    # Writes DATABASE_URL + NEXTAUTH_* into each app's .env

# Run migrations (from repo root)
npm run db:migrate -w invoice-saas
npm run db:migrate -w booking-platform
npm run db:migrate -w analytics-dashboard

# Seed demo data (optional)
npm run demo:seed

# Run an app
npm run dev -w invoice-saas           # http://localhost:3000
npm run dev -w booking-platform      # http://localhost:3001
npm run dev -w analytics-dashboard   # http://localhost:3002
```

**Demo credentials** (after `npm run demo:seed`): `demo@example.com` / `demo1234` (Invoice & Booking)

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shared `@repo/ui`
- **Backend:** Next.js API routes, Drizzle ORM, PostgreSQL
- **Auth:** NextAuth.js (credentials + optional Google OAuth)
- **Payments:** Razorpay (invoice-saas)

## Setup Guide

Each app needs a `.env` file. Copy from `.env.example` in each app folder.

**Full setup:** [docs/GETTING_ACCESS.md](docs/GETTING_ACCESS.md) — database, API keys, and what you need (all free options).

| Doc | Purpose |
|-----|---------|
| [GETTING_ACCESS.md](docs/GETTING_ACCESS.md) | Database, auth, Razorpay setup |
| [RAZORPAY_SETUP.md](docs/RAZORPAY_SETUP.md) | Razorpay keys and webhook (India) |
| [GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md) | "Continue with Google" login |
| [PUSHING_TO_GITHUB.md](docs/PUSHING_TO_GITHUB.md) | Security checklist before pushing |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build all workspaces |
| `npm run lint` | Lint all workspaces |
| `npm run test` | Run tests (analytics: Vitest; invoice: Playwright e2e) |
| `npm run format` | Format with Prettier |
| `npm run db:up` | Start local Postgres (Docker) |
| `npm run db:down` | Stop Postgres container |
| `npm run db:setup` | Write local env into each app's `.env` |
| `npm run demo:seed` | Seed demo data (invoices, bookings, analytics events) |

## Tests

- **Unit:** `npm run test -w analytics-dashboard` (Vitest)
- **E2E:** Start invoice dev server, then `npm run e2e -w invoice-saas` (Playwright)

## CI

GitHub Actions runs on push/PR: install, build UI, lint, format check, build all apps.

## Project Layout

```
apps/
  invoice-saas/       # Invoicing + Razorpay
  booking-platform/   # Booking + owner dashboard
  analytics-dashboard # Metrics + API keys + OpenAPI
packages/
  ui/                 # Shared components + Tailwind preset
docs/                 # Setup guides
scripts/              # Seed, setup, migrations
```
