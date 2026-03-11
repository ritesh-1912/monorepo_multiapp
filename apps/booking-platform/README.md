# Booking Platform

Appointment scheduling: owners manage services, staff, and availability; customers book via a public flow.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind, @repo/ui
- PostgreSQL (Neon), Drizzle ORM
- NextAuth (credentials); first registered user is **owner**, rest are customer

## Setup

1. Copy `.env.example` to `.env` and set:
   - `DATABASE_URL` — Neon or any PostgreSQL
   - `NEXTAUTH_SECRET` — random string
   - `NEXTAUTH_URL` — e.g. `http://localhost:3001`

2. Run migrations (from repo root):

   ```bash
   npm run db:generate -w booking-platform
   npm run db:migrate -w booking-platform
   ```

3. Start:
   ```bash
   npm run dev -w booking-platform
   ```

## Flow

- **Owner:** Register first to become owner. Then: add Services (name, duration), Staff, and Availability (weekly slots per staff). View bookings under Bookings.
- **Customer:** Open `/book` → choose service → staff → date → time slot → enter name/email → confirm. Redirects to `/book/confirmation/[id]`.

## Routes

- `/` — Landing
- `/login`, `/register` — Auth
- `/owner` — Dashboard (owner only)
- `/owner/services`, `/owner/staff`, `/owner/availability`, `/owner/bookings` — Owner CRUD
- `/book` — Public booking (5 steps)
- `/book/confirmation/[id]` — Confirmation

## API

- `GET/POST /api/services`, `GET/POST /api/staff`, `GET/POST /api/availability` — Owner
- `GET /api/public/services`, `GET /api/public/staff` — Public
- `GET /api/slots?serviceId=&staffId=&date=` — Available slots
- `GET/POST /api/bookings` — List (owner) / Create (public)
- `GET /api/bookings/[id]` — Public confirmation data
