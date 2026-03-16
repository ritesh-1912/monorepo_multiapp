# Vercel Deployment & Database Guide

## Why analytics works but invoice-saas doesn't (without DATABASE_URL)

Both apps use `getDb()` in their auth flow. If `DATABASE_URL` is missing, the code throws `DATABASE_URL is not set` when the auth callback runs. Possible explanations for analytics appearing to work:

1. **Shared or inherited variable** – `DATABASE_URL` may exist as a **Shared** environment variable or in a different scope (Production vs Preview) that applies to analytics but not invoice-saas.
2. **Vercel integration** – A storage/Postgres integration might inject a DB-related variable for one project.
3. **Different usage** – Analytics might not have been tested for Google OAuth recently, or only credentials login was used (which runs earlier in the flow).

Regardless, **invoice-saas needs `DATABASE_URL`** for Google OAuth, because the JWT callback runs DB operations to find or create the user.

---

## How to debug what's failing

### 1. Check Vercel function logs

1. **Vercel** → **invoice-saas** → **Deployments** → latest deployment  
2. Open **Functions** (or the function logs)  
3. Attempt **Continue with Google** on the live app  
4. Check logs for `/api/auth/*` – you should see the real error (e.g. `DATABASE_URL is not set`, connection refused, etc.)

### 2. Add temporary debug logging (optional)

In `apps/invoice-saas/src/lib/auth.ts`, wrap the JWT callback DB logic in try/catch and log the error. Then redeploy and reproduce the login – the logged error will appear in Vercel function logs. Remove the logging afterward.

---

## Do you need Neon? Yes, for production

| Environment   | Where code runs        | Database needed              |
|---------------|------------------------|------------------------------|
| **Local dev** | Your machine           | Docker Postgres (localhost)   |
| **Vercel**    | Vercel’s cloud servers | Hosted Postgres (e.g. Neon)  |

Vercel runs serverless functions in the cloud. They **cannot** connect to `localhost` on your machine. `localhost` in Vercel points to the serverless function itself, not your laptop. So production needs a **hosted** Postgres instance.

### Popular free options

- **[Neon](https://neon.tech)** – Free tier, serverless Postgres
- **[Supabase](https://supabase.com)** – Free tier, Postgres + extras
- **[Railway](https://railway.app)** – Free tier Postgres

---

## Add Neon without changing code

Your code already reads `DATABASE_URL`. Integration is done only via environment variables.

### 1. Create a database on Neon

1. Sign up at [neon.tech](https://neon.tech)
2. Create a project
3. Create a database (e.g. `invoice`)
4. Copy the connection string (e.g. `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`)

### 2. Add it in Vercel

1. **Vercel** → **invoice-saas** → **Settings** → **Environment Variables**
2. Add `DATABASE_URL` with the Neon connection string
3. Scope: Production (and Preview if you want)
4. Redeploy (or trigger a new deployment)

No code changes are required. The app already uses `process.env.DATABASE_URL`.

### 3. Run migrations against Neon

Locally, point to Neon and run migrations:

```bash
cd apps/invoice-saas
DATABASE_URL="postgresql://your-neon-connection-string" npx drizzle-kit push
# or: npx drizzle-kit migrate
```

This creates/updates tables in Neon. Then redeploy on Vercel.

---

## What’s the point of Docker? Is it useless after deployment?

**Docker is not useless.** It’s for **local development** only, not for production.

| Phase         | Database               | Purpose                                      |
|---------------|------------------------|----------------------------------------------|
| **Local dev** | Docker Postgres        | Run the app locally with a DB on your machine |
| **Production**| Neon / Supabase / etc. | Run the app on Vercel with a cloud DB        |

Docker Postgres gives you a local Postgres instance so you can:

- Develop without a cloud account
- Run migrations, seed data, and test locally
- Work offline or without an internet connection
- Avoid hitting free-tier limits during development

Vercel cannot reach your laptop. That’s why Docker is for local, and Neon/Supabase is for production. Both are used, at different stages.

---

## Summary checklist for invoice-saas on Vercel

- [ ] `DATABASE_URL` – Neon (or another hosted Postgres) connection string
- [ ] `NEXTAUTH_SECRET` – 32+ character random string
- [ ] `NEXTAUTH_URL` – `https://monorepo-multiapp-invoice-saas.vercel.app`
- [ ] `AUTH_TRUST_HOST` – `true`
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` – from Google Cloud Console
- [ ] Migrations run against the Neon database
- [ ] Redeploy after adding or changing env vars
