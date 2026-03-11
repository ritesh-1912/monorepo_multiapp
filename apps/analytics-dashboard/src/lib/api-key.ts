/**
 * API key generation and verification. Store hash + prefix; verify via hash comparison.
 */
import crypto from 'crypto';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

const PREFIX = 'ak_';
const KEY_BYTES = 24;
const PREFIX_DISPLAY_LEN = 10;

function hash(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function generateKey(): { key: string; keyHash: string; keyPrefix: string } {
  const raw = crypto.randomBytes(KEY_BYTES).toString('hex');
  const key = PREFIX + raw;
  return {
    key,
    keyHash: hash(key),
    keyPrefix: key.slice(0, PREFIX_DISPLAY_LEN),
  };
}

export async function validateKey(bearer: string): Promise<string | null> {
  if (!bearer.startsWith(PREFIX)) return null;
  const keyHash = hash(bearer);
  const db = getDb();
  const keys = await db.select().from(schema.apiKeys);
  const match = keys.find((k) => k.keyHash === keyHash);
  if (!match) return null;
  await db
    .update(schema.apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(schema.apiKeys.id, match.id));
  return match.userId;
}
