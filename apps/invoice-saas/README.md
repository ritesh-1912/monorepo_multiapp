# Invoice SaaS

Create and send professional invoices, share a public link, and collect payment via **Razorpay**.

## Features

- Create invoices with line items, due dates, client info
- Public invoice page at `/invoice/[publicId]` — no login required for clients
- **Pay now** — Razorpay Checkout
- Webhook marks invoice as Paid automatically
- Dashboard: invoice list, KPIs, audit log
- Auth: credentials + optional Google OAuth

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind, @repo/ui
- PostgreSQL, Drizzle ORM
- NextAuth (credentials + optional Google)
- Razorpay (payments)

## Setup

1. **Copy env:**
   ```bash
   cp .env.example .env
   ```

2. **Set in `.env`:**
   - `DATABASE_URL` — PostgreSQL (e.g. `postgresql://postgres:postgres@localhost:5432/invoice` with Docker)
   - `NEXTAUTH_SECRET` — run `node scripts/generate-secret.js` from repo root
   - `NEXTAUTH_URL` — `http://localhost:3000`
   - **Razorpay:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, optional `RAZORPAY_WEBHOOK_SECRET` — see [RAZORPAY_SETUP.md](../../docs/RAZORPAY_SETUP.md)

3. **Migrations** (from repo root):
   ```bash
   npm run db:migrate -w invoice-saas
   ```

4. **Run:**
   ```bash
   npm run dev -w invoice-saas
   ```

5. **Demo data** (optional):
   ```bash
   npm run demo:seed
   ```
   Then log in as `demo@example.com` / `demo1234`

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing |
| `/login`, `/register` | Auth |
| `/dashboard` | Invoice list, KPIs |
| `/dashboard/invoices/new` | Create invoice |
| `/dashboard/settings` | Settings |
| `/dashboard/audit-log` | Audit log |
| `/invoice/[publicId]` | Public invoice + Pay now (Razorpay) |

## E2E Tests

```bash
npm run dev -w invoice-saas   # Terminal 1
npm run e2e -w invoice-saas  # Terminal 2
```

## API

- `GET/POST /api/invoices` — List/create invoices
- `GET/PATCH/DELETE /api/invoices/[id]` — Invoice CRUD
- `GET /api/invoice/public/[publicId]` — Public invoice data
- `POST /api/checkout` — Create Razorpay order
- `POST /api/webhooks/razorpay` — Razorpay webhook
