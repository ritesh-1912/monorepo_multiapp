# Analytics Dashboard

Metrics dashboard with RBAC, charts, saved views, export, and a public API with API keys + OpenAPI docs.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind, @repo/ui
- PostgreSQL (Neon), Drizzle ORM
- NextAuth (credentials); **first user = admin**, rest = viewer
- Recharts for charts; API keys (hashed) for public API

## Setup

1. Copy `.env.example` to `.env` and set:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (e.g. `http://localhost:3002`)

2. Migrations (from repo root):

   ```bash
   npm run db:generate -w analytics-dashboard
   npm run db:migrate -w analytics-dashboard
   ```

3. Start:
   ```bash
   npm run dev -w analytics-dashboard
   ```

## Flow

- **First user:** Register → becomes **admin** (can seed data, create API keys).
- **Admin:** Dashboard → Seed data (POST /api/seed) → view KPIs, time series, bar chart, events table. Save views, Export CSV. Settings → Create/revoke API keys.
- **Viewer:** Dashboard, saved views, export only (no seed, no API keys).
- **Public API:** `GET /api/v1/metrics?from=&to=&metric=` with `Authorization: Bearer <api_key>`.

## Routes

- `/` — Landing
- `/login`, `/register`
- `/dashboard` — Filters, KPIs, revenue line chart, by-metric bar chart, events table, save view, export
- `/dashboard/views` — Saved views, load (redirects to dashboard with filters)
- `/dashboard/settings` — Profile, API keys (admin)
- `/api-docs` — Swagger UI for OpenAPI spec

## API

- `GET /api/metrics?from=&to=&metric=` — Aggregated + time series (auth)
- `GET /api/events?from=&to=&metric=&page=&limit=` — Raw events (auth)
- `GET /api/export?from=&to=&format=csv` — CSV download (auth)
- `POST /api/seed` — Generate 90 days sample data (admin)
- `GET/POST /api/views`, `DELETE /api/views/[id]` — Saved views (auth)
- `GET/POST /api/api-keys`, `DELETE /api/api-keys/[id]` — API keys (admin)
- `GET /api/v1/metrics?from=&to=&metric=` — Public API (Bearer API key)
- `GET /api/openapi` — OpenAPI 3.0 spec
