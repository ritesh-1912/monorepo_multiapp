# Invoice SaaS

**Problem:** Freelancers need to send professional invoices and get paid online.  
**Solution:** Create and send invoices, share a public link, and collect payment with Stripe.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind, @repo/ui
- PostgreSQL (Neon), Drizzle ORM
- NextAuth (credentials + optional Google)
- Stripe (Checkout + webhooks). Optional: Resend, PDF, R2

## Setup

1. Copy `.env.example` to `.env` and set:
   - `DATABASE_URL` — Neon or any PostgreSQL (or `postgresql://postgres:postgres@localhost:5432/postgres` with Docker)
   - `NEXTAUTH_SECRET` — e.g. `openssl rand -base64 32`
   - `NEXTAUTH_URL` — `http://localhost:3000`
   - **Razorpay (India):** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` — see [docs/RAZORPAY_SETUP.md](../../docs/RAZORPAY_SETUP.md)

- **Stripe (outside India):** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

2. Migrations (from repo root):

   ```bash
   npm run db:generate -w invoice-saas
   npm run db:migrate -w invoice-saas
   ```

3. Run:
   ```bash
   npm run dev -w invoice-saas
   ```

## Routes

- `/` — Landing; `/login`, `/register` — Auth
- `/dashboard` — Invoices list, KPIs, link to public invoice
- `/dashboard/invoices/new` — Create invoice
- `/dashboard/settings`, `/dashboard/audit-log`
- `/invoice/[publicId]` — Public invoice view + Pay with Stripe

## Status

- Auth (register/login, NextAuth credentials + optional Google), dashboard protected
- Invoices CRUD (API + UI), public invoice page, Stripe Checkout + webhook
- E2E: `npm run e2e` (start dev server on port 3000 first)

## E2E tests

```bash
npm run dev -w invoice-saas   # in one terminal
npm run e2e -w invoice-saas   # in another
```
