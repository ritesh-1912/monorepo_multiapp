/**
 * DELETE /api/api-keys/[id] — revoke key. Admin only.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { and, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const db = getDb();
  const result = await db
    .delete(schema.apiKeys)
    .where(and(eq(schema.apiKeys.id, params.id), eq(schema.apiKeys.userId, session.user.id)))
    .returning({ id: schema.apiKeys.id });

  if (result.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
