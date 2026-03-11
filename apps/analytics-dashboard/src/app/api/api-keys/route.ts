/**
 * GET /api/api-keys — list (prefix only). POST /api/api-keys — create (returns full key once). Admin only.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { generateKey } from '@/lib/api-key';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const db = getDb();
  const keys = await db
    .select({
      id: schema.apiKeys.id,
      keyPrefix: schema.apiKeys.keyPrefix,
      createdAt: schema.apiKeys.createdAt,
    })
    .from(schema.apiKeys)
    .where(eq(schema.apiKeys.userId, session.user.id));
  return NextResponse.json({ apiKeys: keys });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { key, keyHash, keyPrefix } = generateKey();
  const db = getDb();
  await db.insert(schema.apiKeys).values({
    userId: session.user.id,
    keyHash,
    keyPrefix,
  });

  return NextResponse.json(
    {
      key,
      keyPrefix,
      message: 'Store the key securely. It will not be shown again.',
    },
    { status: 201 }
  );
}
