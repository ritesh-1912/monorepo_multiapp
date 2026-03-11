/**
 * Public list of staff (for booking flow).
 */
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { getDb, schema } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const staff = await db.select().from(schema.staff);
  return NextResponse.json({ staff });
}
