# API Keys & Access (All Free)

This project needs a few credentials. Everything below is **free** and suitable for a portfolio/passion project.

---

## Order of operations

Do these in order. You can run the apps with **only Step 1 + Step 2** (database + auth). Stripe is optional until you want to demo payments.

| Step | What                                  | Required? | Cost                       |
| ---- | ------------------------------------- | --------- | -------------------------- |
| 1    | PostgreSQL database                   | Yes       | Free                       |
| 2    | NextAuth secret (generated locally)   | Yes       | Free                       |
| 3    | Razorpay (India) or Stripe (payments) | Optional  | Free (test mode)           |
| 4    | Google OAuth (“Login with Google”)    | Optional  | Free (skip for simplicity) |

---

## Step 1: PostgreSQL database (required)

You need one PostgreSQL database. All three apps can share one DB (different tables) or use separate DBs.

### Option A: Local with Docker (recommended, no signup)

1. Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running.
2. From the project root:
   ```bash
   npm run db:up
   ```
   This starts Postgres 16 in the background (port 5432). Each app uses its own database (`invoice`, `booking`, `analytics`) to avoid schema conflicts.
3. Create or update each app’s `.env` with the local DB and auth:
   ```bash
   npm run db:setup
   ```
   This writes `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` into each app’s `.env` (from `.env.example` if `.env` doesn’t exist). You can run it again safely; it won’t overwrite existing values you’ve changed.
4. Run migrations and seed demo data:
   ```bash
   npm run build -w @repo/ui
   npm run db:migrate -w invoice-saas
   npm run db:migrate -w booking-platform
   npm run db:migrate -w analytics-dashboard
   npm run demo:seed
   ```
   `demo:seed` populates all three apps with sample data so dashboards look complete. Log in as **demo@example.com** / **demo1234** for Invoice and Booking. For Analytics, register the first user (they become admin) and use **Settings → Seed demo data** to populate metrics.
5. Start an app:
   ```bash
   npm run dev -w invoice-saas
   ```
   If `db:migrate` can’t find `DATABASE_URL`, run it from the app directory: `cd apps/invoice-saas && export $(grep -v '^#' .env | xargs) && npx drizzle-kit migrate` (and similarly for the other apps).

**Other Docker commands (from repo root):**

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `npm run db:up`   | Start Postgres (detached)     |
| `npm run db:down` | Stop and remove the container |
| `npm run db:logs` | Stream Postgres logs          |

### Option B: Neon (hosted, free tier)

1. Go to [neon.tech](https://neon.tech) and sign up (free).
2. Create a new project (e.g. “portfolio-demo”).
3. Copy the **connection string** from the dashboard (looks like `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`).
4. Put that in each app’s `.env` as `DATABASE_URL`.  
   You can use one Neon project and one database for all three apps, or one DB per app—your choice.

---

## Step 2: NextAuth secret (required)

No signup. Generate a secret on your machine and put it in each app’s `.env`.

1. In the project root, run:

   ```bash
   node scripts/generate-secret.js
   ```

   (Or run `openssl rand -base64 32` and copy the output.)

2. Copy the output (a long random string).

3. In **each** app folder (`apps/invoice-saas`, `apps/booking-platform`, `apps/analytics-dashboard`):
   - Copy `.env.example` to `.env` if you haven’t already.
   - Set:
     ```env
     NEXTAUTH_SECRET=<paste the generated value>
     NEXTAUTH_URL=http://localhost:3000   # invoice-saas
     NEXTAUTH_URL=http://localhost:3001   # booking-platform
     NEXTAUTH_URL=http://localhost:3002   # analytics-dashboard
     ```

---

## Step 3: Razorpay or Stripe (optional – for “Pay now” on invoices)

**In India use Razorpay** (Stripe doesn’t support Indian businesses). Elsewhere you can use Stripe.

### Razorpay (recommended in India)

1. Sign up at [dashboard.razorpay.com](https://dashboard.razorpay.com) (free).
2. **Settings → API Keys**: create/copy **Key ID** and **Key Secret**.
3. In `apps/invoice-saas/.env` set:
   - `RAZORPAY_KEY_ID=rzp_test_...`
   - `RAZORPAY_KEY_SECRET=...`
4. For “Pay now” to also mark the invoice as **Paid** after payment, add a webhook in Razorpay Dashboard → Webhooks → URL `https://your-domain/api/webhooks/razorpay`, event **payment.captured**. Copy the webhook **Secret** and set `RAZORPAY_WEBHOOK_SECRET` in `.env`.

Full step-by-step: [docs/RAZORPAY_SETUP.md](RAZORPAY_SETUP.md).

### Stripe (outside India)

Only needed if you want the invoice app’s “Pay with Stripe” button to work. **Fully free** in test mode (no real charges).

1. Sign up at [stripe.com](https://stripe.com) (free account).
2. In the Dashboard, switch to **Test mode** (toggle in the top right).
3. Go to **Developers → API keys**. Copy:
   - **Secret key** (starts with `sk_test_...`) → `STRIPE_SECRET_KEY` in `apps/invoice-saas/.env`.
   - **Publishable key** (starts with `pk_test_...`) → optional `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` if you add Stripe.js on the client later.
4. For the webhook (so “invoice paid” is recorded when a test payment completes):
   - **Local dev:** Install [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:
     ```bash
     stripe login
     stripe listen --forward-to localhost:3000/api/webhooks/stripe
     ```
     Copy the **webhook signing secret** (`whsec_...`) and set `STRIPE_WEBHOOK_SECRET` in `apps/invoice-saas/.env`.
   - **Deployed (e.g. Vercel):** In Stripe Dashboard → Developers → Webhooks, add endpoint `https://your-domain.com/api/webhooks/stripe`, select `checkout.session.completed`, and use the signing secret as `STRIPE_WEBHOOK_SECRET`.

If you **don’t** set Stripe keys: the app still runs; the public invoice page shows “Pay with Stripe” and clicking it shows “Payments are not configured” (graceful).

---

## Step 4: Google OAuth (optional)

Add “Continue with Google” on the login page. Free: create a Web application OAuth client in [Google Cloud Console](https://console.cloud.google.com/), set redirect URI to `https://your-domain/api/auth/callback/google`, then set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `apps/invoice-saas/.env`. Step-by-step: [docs/GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md).

---

## Quick checklist

- [ ] **Database:** Docker `docker compose up -d` **or** Neon connection string in each app’s `.env`.
- [ ] **Auth:** Run `node scripts/generate-secret.js`, set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` in each app’s `.env`.
- [ ] **Stripe (optional):** Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to `apps/invoice-saas/.env` when you want to demo payments.

Then from the repo root:

```bash
npm run build -w @repo/ui
npm run db:migrate -w invoice-saas
npm run db:migrate -w booking-platform
npm run db:migrate -w analytics-dashboard
npm run dev -w invoice-saas
```

Repeat `npm run dev -w ...` for the other apps on 3001 and 3002 as needed.
