/**
 * Settings: profile and API keys (admin only).
 * Server component – imports plain elements only; UI from @repo/ui is rendered via client components.
 */
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { ApiKeysManager } from './ApiKeysManager';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const isAdmin = session.user.role === 'admin';
  const db = getDb();
  const apiKeysRaw = isAdmin
    ? await db
        .select({
          id: schema.apiKeys.id,
          keyPrefix: schema.apiKeys.keyPrefix,
          createdAt: schema.apiKeys.createdAt,
        })
        .from(schema.apiKeys)
        .where(eq(schema.apiKeys.userId, session.user.id))
    : [];
  const apiKeys = apiKeysRaw.map((k) => ({
    id: k.id,
    keyPrefix: k.keyPrefix,
    createdAt: k.createdAt?.toISOString?.() ?? new Date().toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Profile and API keys.</p>
      </div>
      <ApiKeysManager
        initialKeys={apiKeys}
        userEmail={session.user.email ?? ''}
        role={session.user.role ?? ''}
        isAdmin={isAdmin}
        showSeedButton={isAdmin}
      />
    </div>
  );
}
