#!/usr/bin/env node
/**
 * One-time setup for local dev with Docker Postgres.
 * - Starts from each app's .env.example
 * - Sets DATABASE_URL to local Postgres and NEXTAUTH_URL per app
 * - Generates and sets NEXTAUTH_SECRET (same for all apps)
 *
 * Run from repo root: npm run db:setup
 * Requires: Docker Postgres already running (npm run db:up)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const DB_HOST = 'postgresql://postgres:postgres@localhost:5432';

const APPS = [
  { dir: 'apps/invoice-saas', NEXTAUTH_URL: 'http://localhost:3000', db: 'invoice' },
  { dir: 'apps/booking-platform', NEXTAUTH_URL: 'http://localhost:3001', db: 'booking' },
  { dir: 'apps/analytics-dashboard', NEXTAUTH_URL: 'http://localhost:3002', db: 'analytics' },
];

function envLine(key, value) {
  return `${key}=${value}`;
}

function parseEnv(content) {
  const out = {};
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

function serializeEnv(obj) {
  return (
    Object.entries(obj)
      .map(([k, v]) => envLine(k, v))
      .join('\n') + '\n'
  );
}

const secret = crypto.randomBytes(32).toString('base64');

for (const app of APPS) {
  const appRoot = path.join(ROOT, app.dir);
  const examplePath = path.join(appRoot, '.env.example');
  const envPath = path.join(appRoot, '.env');

  let env = {};
  if (fs.existsSync(envPath)) {
    env = parseEnv(fs.readFileSync(envPath, 'utf8'));
  } else if (fs.existsSync(examplePath)) {
    env = parseEnv(fs.readFileSync(examplePath, 'utf8'));
  }

  env.DATABASE_URL = `${DB_HOST}/${app.db}`;
  env.NEXTAUTH_SECRET = env.NEXTAUTH_SECRET || secret;
  env.NEXTAUTH_URL = env.NEXTAUTH_URL || app.NEXTAUTH_URL;

  fs.writeFileSync(envPath, serializeEnv(env), 'utf8');
  console.log('Updated', app.dir, '.env');
}

console.log(
  '\nDone. Next: npm run build -w @repo/ui && npm run db:migrate -w invoice-saas && npm run db:migrate -w booking-platform && npm run db:migrate -w analytics-dashboard'
);
