/**
 * Database client for Booking Platform.
 * Uses node-postgres (pg) so it works with local Docker Postgres as well as hosted Postgres.
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  return url;
}

let pool: Pool | null = null;

export function getDb() {
  if (!pool) {
    pool = new Pool({ connectionString: getDatabaseUrl() });
  }
  return drizzle(pool, { schema });
}

export type Db = ReturnType<typeof getDb>;
export { schema };
