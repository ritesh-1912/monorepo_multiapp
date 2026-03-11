/**
 * Public list of services (for booking flow). Returns all services.
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getDb, schema } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const services = await db.select().from(schema.services);
  return NextResponse.json({ services });
}
