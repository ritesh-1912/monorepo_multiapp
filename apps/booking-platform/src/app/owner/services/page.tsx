/**
 * Owner services list and add form.
 */
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { ServicesManager } from './ServicesManager';

export const dynamic = 'force-dynamic';

export default async function OwnerServicesPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'owner') redirect('/login');

  const db = getDb();
  const services = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.userId, session.user.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Services</h1>
        <p className="text-muted-foreground">Services customers can book.</p>
      </div>
      <ServicesManager initialServices={services} />
    </div>
  );
}
