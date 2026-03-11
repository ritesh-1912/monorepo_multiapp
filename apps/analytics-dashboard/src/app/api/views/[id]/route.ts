/**
 * DELETE /api/views/[id] — delete saved view. Auth required.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { and, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const result = await db
    .delete(schema.savedViews)
    .where(and(eq(schema.savedViews.id, params.id), eq(schema.savedViews.userId, session.user.id)))
    .returning({ id: schema.savedViews.id });

  if (result.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
