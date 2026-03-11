# Booking Platform

Appointment scheduling: owners manage services, staff, and availability; customers book via a public flow at `/book`.

## Features

- **Owner:** Add services (name, duration), staff, weekly availability slots
- **Customer:** Public booking flow — choose service → staff → date → time → confirm
- No login required for customers
- First registered user becomes **owner**, others are customers

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind, @repo/ui
- PostgreSQL, Drizzle ORM
- NextAuth (credentials + optional Google)

## Setup

1. **Copy env:**
   ```bash
   cp .env.example .env
   ```

2. **Set in `.env`:**
   - `DATABASE_URL` — PostgreSQL (e.g. `postgresql://postgres:postgres@localhost:5432/booking`)
   - `NEXTAUTH_SECRET` — run `node scripts/generate-secret.js` from repo root
   - `NEXTAUTH_URL` — `http://localhost:3001`

3. **Migrations** (from repo root):
   ```bash
   npm run db:migrate -w booking-platform
   ```

4. **Run:**
   ```bash
   npm run dev -w booking-platform
   ```

5. **Demo data** (optional):
   ```bash
   npm run demo:seed
   ```
   Then log in as `demo@example.com` / `demo1234` to see services, staff, and sample bookings.

## Flow

**Owner (first user):**
1. Register at `/register`
2. Add services: `/owner/services`
3. Add staff: `/owner/staff`
4. Set availability: `/owner/availability`
5. View bookings: `/owner/bookings`

**Customer:**
1. Go to `/book`
2. Choose service → staff → date → time slot
3. Enter name and email
4. Confirm → `/book/confirmation/[id]`

## Routes

| Path | Purpose |
|------|---------|
| `/` | Landing |
| `/login`, `/register` | Auth |
| `/book` | Public booking (5 steps) |
| `/book/confirmation/[id]` | Booking confirmation |
| `/owner` | Owner dashboard |
| `/owner/services` | Manage services |
| `/owner/staff` | Manage staff |
| `/owner/availability` | Set weekly slots |
| `/owner/bookings` | View bookings |

## API

| Endpoint | Purpose |
|----------|---------|
| `GET/POST /api/services` | Owner: list/create services |
| `GET/POST /api/staff` | Owner: list/create staff |
| `GET/POST /api/availability` | Owner: list/create availability |
| `GET /api/public/services` | Public: list services |
| `GET /api/public/staff` | Public: list staff |
| `GET /api/slots?serviceId=&staffId=&date=` | Available time slots |
| `GET/POST /api/bookings` | List (owner) / Create (public) |
| `GET /api/bookings/[id]` | Booking details (confirmation) |
