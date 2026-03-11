# Portfolio Full-Stack Projects

Monorepo with three full-stack apps and a shared UI package. Suited for portfolio demos and freelancing (Fiverr, Upwork).

| App                     | Purpose                                                               | Port |
| ----------------------- | --------------------------------------------------------------------- | ---- |
| **invoice-saas**        | Invoicing: create/send invoices, Stripe payments, public invoice page | 3000 |
| **booking-platform**    | Appointments: services, staff, availability, public booking flow      | 3001 |
| **analytics-dashboard** | Metrics: KPIs, charts, saved views, API keys, OpenAPI docs            | 3002 |

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shared `@repo/ui`
- **Backend:** Next.js API routes, Drizzle ORM, PostgreSQL (Neon)
- **Auth:** NextAuth.js (credentials; role-based in booking and analytics)
- **Payments:** Stripe (invoice-saas)

## Setup

```bash
npm install
```

Build the shared UI once, then run any app:

```bash
npm run build -w @repo/ui

npm run dev -w invoice-saas           # http://localhost:3000
npm run dev -w booking-platform       # http://localhost:3001
npm run dev -w analytics-dashboard    # http://localhost:3002
```

Each app needs its own `.env` (copy from `.env.example`). **Setup guide:** [docs/GETTING_ACCESS.md](docs/GETTING_ACCESS.md) — what API keys/access you need, all free (DB, NextAuth secret, optional Stripe).

## Scripts

| Command                | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `npm run build`        | Build all workspaces                                          |
| `npm run lint`         | Lint all workspaces                                           |
| `npm run test`         | Run tests in workspaces that define them                      |
| `npm run format`       | Format with Prettier                                          |
| `npm run format:check` | Check formatting                                              |
| `npm run db:up`        | Start local Postgres (Docker)                                 |
| `npm run db:down`      | Stop Postgres container                                       |
| `npm run db:logs`      | Stream Postgres logs                                          |
| `npm run db:setup`     | Write local DATABASE*URL + NEXTAUTH*\* into each app’s `.env` |

## Tests

- **Unit:** `npm run test -w analytics-dashboard` (Vitest; api-key helpers).
- **E2E:** In invoice-saas, start dev server then `npm run e2e -w invoice-saas` (Playwright; landing + auth routes).

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on push/PR: install, build UI, lint, format check, and build all three apps. Tests run when present.

## Local database (Docker)

With Docker installed and running:

```bash
npm run db:up      # start Postgres (port 5432)
npm run db:setup   # write DATABASE_URL + NEXTAUTH_* into each app's .env
```

Then run migrations and start an app (see [docs/GETTING_ACCESS.md](docs/GETTING_ACCESS.md)). To stop Postgres: `npm run db:down`.

## Project layout

```
apps/
  invoice-saas/       # Invoicing + Stripe
  booking-platform/   # Booking flow + owner dashboard
  analytics-dashboard # Metrics + API keys + OpenAPI
packages/
  ui/                 # Shared components + Tailwind preset
```
