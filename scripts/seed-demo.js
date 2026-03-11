#!/usr/bin/env node
/**
 * Seed demo data for all three apps. Run after migrations.
 * Usage: npm run demo:seed
 * Requires: DATABASE_URL in each app's .env, Docker Postgres running.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');

function loadEnv(appDir) {
  const envPath = path.join(ROOT, appDir, '.env');
  if (!fs.existsSync(envPath)) return null;
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  return env;
}

async function withDb(url, fn) {
  const { Client } = require('pg');
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

function hashPassword(password) {
  const bcrypt = require('bcryptjs');
  return bcrypt.hashSync(password, 10);
}

async function seedAnalytics() {
  const env = loadEnv('apps/analytics-dashboard');
  if (!env?.DATABASE_URL) {
    console.log('Skip analytics: no DATABASE_URL');
    return;
  }
  await withDb(env.DATABASE_URL, async (client) => {
    await client.query('DELETE FROM events');
    const now = new Date();
    const rows = [];
    for (let d = 90; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      const dayKey = date.toISOString().slice(0, 10);
      const ts = dayKey + ' 12:00:00+00';
      const revenue = Math.floor(500 + Math.random() * 4500);
      const signups = Math.floor(10 + Math.random() * 70);
      const pageViews = Math.floor(100 + Math.random() * 1900);
      const sources = ['web', 'mobile', 'api'];
      rows.push(['revenue', ts, revenue, null]);
      rows.push(['signups', ts, signups, null]);
      rows.push(['page_views', ts, pageViews, JSON.stringify({ source: sources[d % 3] })]);
    }
    for (const [ev, ts, val, dim] of rows) {
      await client.query(
        'INSERT INTO events (event_name, timestamp, value, dimensions) VALUES ($1, $2::timestamptz, $3, $4)',
        [ev, ts, val, dim]
      );
    }
    console.log('Analytics: seeded', rows.length, 'events');
  });
}

async function seedInvoice() {
  const env = loadEnv('apps/invoice-saas');
  if (!env?.DATABASE_URL) {
    console.log('Skip invoice: no DATABASE_URL');
    return;
  }
  const hashed = hashPassword('demo1234');
  await withDb(env.DATABASE_URL, async (client) => {
    let r = await client.query("SELECT id FROM users WHERE email = 'demo@example.com'");
    let userId = r.rows[0]?.id;
    if (!userId) {
      await client.query(
        `INSERT INTO users (id, email, hashed_password, name, created_at, updated_at)
         VALUES (gen_random_uuid(), 'demo@example.com', $1, 'Demo User', NOW(), NOW())
         RETURNING id`,
        [hashed]
      );
      r = await client.query("SELECT id FROM users WHERE email = 'demo@example.com'");
      userId = r.rows[0].id;
    }
    const clients = [
      ['Acme Corp', 'billing@acme.com'],
      ['TechStart Inc', 'finance@techstart.io'],
      ['Design Studio', 'accounts@designstudio.com'],
      ['Global Solutions', 'ap@globalsolutions.co'],
      ['Beta Labs', 'billing@betalabs.dev'],
    ];
    const statuses = ['draft', 'sent', 'paid', 'sent', 'paid', 'overdue'];
    let count = 0;
    for (let i = 0; i < 6; i++) {
      const pubId = 'inv_' + crypto.randomBytes(8).toString('hex');
      const [cName, cEmail] = clients[i % clients.length];
      const due = new Date();
      due.setDate(due.getDate() + 14 - i * 3);
      const created = new Date();
      created.setDate(created.getDate() - i * 5);
      await client.query(
        `INSERT INTO invoices (user_id, public_id, client_name, client_email, status, currency, due_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'USD', $6, $7, $8)
         ON CONFLICT (public_id) DO NOTHING`,
        [userId, pubId, cName, cEmail, statuses[i], due, created, created]
      );
      r = await client.query('SELECT id FROM invoices WHERE public_id = $1', [pubId]);
      if (r.rows.length > 0) {
        const amt = Math.floor(150 + Math.random() * 850) * 100;
        await client.query(
          `INSERT INTO invoice_items (invoice_id, description, quantity, unit_amount_cents, "order")
           VALUES ($1, 'Consulting services', 1, $2, 0)`,
          [r.rows[0].id, amt]
        );
        count++;
      }
    }
    console.log('Invoice: seeded', count, 'invoices for demo@example.com');
  });
}

async function seedBooking() {
  const env = loadEnv('apps/booking-platform');
  if (!env?.DATABASE_URL) {
    console.log('Skip booking: no DATABASE_URL');
    return;
  }
  const hashed = hashPassword('demo1234');
  await withDb(env.DATABASE_URL, async (client) => {
    let r = await client.query("SELECT id FROM users WHERE email = 'demo@example.com'");
    let userId = r.rows[0]?.id;
    if (!userId) {
      await client.query(
        `INSERT INTO users (id, email, hashed_password, name, role, created_at)
         VALUES (gen_random_uuid(), 'demo@example.com', $1, 'Demo Owner', 'owner', NOW())
         RETURNING id`,
        [hashed]
      );
      r = await client.query("SELECT id FROM users WHERE email = 'demo@example.com'");
      userId = r.rows[0].id;
    } else {
      await client.query(
        "UPDATE users SET role = 'owner', hashed_password = $1 WHERE email = 'demo@example.com'",
        [hashed]
      );
    }
    r = await client.query('SELECT id FROM staff WHERE user_id = $1', [userId]);
    if (r.rows.length > 0) {
      console.log('Booking: demo data already exists');
      return;
    }
    r = await client.query(
      'INSERT INTO staff (user_id, name, created_at) VALUES ($1, $2, NOW()) RETURNING id',
      [userId, 'Alex Chen']
    );
    const staffId = r.rows[0].id;
    await client.query(
      `INSERT INTO services (user_id, name, duration_minutes, created_at)
       VALUES ($1, 'Consultation', 30, NOW()), ($1, 'Strategy Session', 60, NOW()), ($1, 'Workshop', 120, NOW())`,
      [userId]
    );
    for (let d = 1; d <= 5; d++) {
      await client.query(
        'INSERT INTO availability (staff_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4)',
        [staffId, d, '09:00', '17:00']
      );
    }
    r = await client.query('SELECT id FROM services WHERE user_id = $1', [userId]);
    const svcIds = r.rows.map((x) => x.id);
    for (let i = 0; i < 5; i++) {
      const start = new Date();
      start.setDate(start.getDate() + i + 1);
      start.setHours(10 + i, 0, 0, 0);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 60);
      await client.query(
        `INSERT INTO bookings (service_id, staff_id, customer_name, customer_email, start_at, end_at, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'confirmed', NOW())`,
        [
          svcIds[i % svcIds.length],
          staffId,
          `Customer ${i + 1}`,
          `customer${i + 1}@example.com`,
          start,
          end,
        ]
      );
    }
    console.log('Booking: seeded services, availability, and 5 bookings for demo@example.com');
  });
}

async function main() {
  console.log('Seeding demo data...\n');
  try {
    await seedAnalytics();
    await seedInvoice();
    await seedBooking();
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
  console.log(
    '\nDone. Log in as demo@example.com / demo1234 to see demo data (Invoice & Booking).'
  );
  console.log('Analytics: register first user as admin, or run seed then log in to see charts.');
}

main();
