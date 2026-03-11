# Analytics Dashboard

Metrics dashboard with role-based access, KPIs, charts, saved views, CSV export, and a public API with API keys and OpenAPI docs.

## Features

- **Admin** (first registered user): Full access, seed data, create API keys
- **Viewer:** Dashboard, saved views, export (no seed, no API keys)
- KPIs, revenue time series, bar chart by metric, events table
- Save filter combinations as views
- Export to CSV
- Public API at `/api/v1/metrics` with Bearer API key
- Swagger UI at `/api-docs` for OpenAPI spec

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind, @repo/ui
- PostgreSQL, Drizzle ORM
- NextAuth (credentials + optional Google)
- Recharts for charts

## Setup

1. **Copy env:**
   ```bash
   cp .env.example .env
   ```

2. **Set in `.env`:**
   - `DATABASE_URL` — PostgreSQL (e.g. `postgresql://postgres:postgres@localhost:5432/analytics`)
   - `NEXTAUTH_SECRET` — run `node scripts/generate-secret.js` from repo root
   - `NEXTAUTH_URL` — `http://localhost:3002`

3. **Migrations** (from repo root):
   ```bash
   npm run db:migrate -w analytics-dashboard
   ```

4. **Run:**
   ```bash
   npm run dev -w analytics-dashboard
   ```

5. **Seed demo data:** Register first user (becomes admin), then use "Seed demo data" in Settings, or:
   ```bash
   npm run demo:seed
   ```
   Then register and log in to see charts.

## Flow

1. **First user** registers → becomes **admin**
2. **Admin:** Settings → Seed demo data (or `POST /api/seed`)
3. Dashboard shows KPIs, revenue chart, bar chart, events table
4. Save views, export CSV
5. Create API keys for public API access

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing |
| `/login`, `/register` | Auth |
| `/dashboard` | KPIs, charts, events, save view, export |
| `/dashboard/views` | Saved views |
| `/dashboard/settings` | Profile, API keys (admin) |
| `/api-docs` | Swagger UI (OpenAPI) |

## API

| Endpoint | Purpose |
|----------|---------|
| `GET /api/metrics?from=&to=&metric=` | Aggregated + time series (auth) |
| `GET /api/events?from=&to=&metric=&limit=` | Raw events (auth) |
| `GET /api/export?from=&to=&format=csv` | CSV download (auth) |
| `POST /api/seed` | Generate 90 days sample data (admin) |
| `GET/POST /api/views` | Saved views (auth) |
| `GET/POST /api/api-keys` | API keys (admin) |
| `GET /api/v1/metrics?from=&to=&metric=` | **Public API** — `Authorization: Bearer <api_key>` |
| `GET /api/openapi` | OpenAPI 3.0 spec |

## Tests

```bash
npm run test -w analytics-dashboard   # Vitest (api-key helpers)
```
