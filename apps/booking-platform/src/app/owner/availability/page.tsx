/**
 * Owner availability: set weekly hours per staff.
 */
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { AvailabilityManager } from './AvailabilityManager';

export const dynamic = 'force-dynamic';

export default async function OwnerAvailabilityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'owner') redirect('/login');

  const db = getDb();
  const staff = await db
    .select()
    .from(schema.staff)
    .where(eq(schema.staff.userId, session.user.id));
  const availability = await db.select().from(schema.availability);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Availability</h1>
        <p className="text-muted-foreground">
          Weekly hours per staff. Slots are generated from these.
        </p>
      </div>
      <AvailabilityManager staff={staff} initialAvailability={availability} />
    </div>
  );
}
