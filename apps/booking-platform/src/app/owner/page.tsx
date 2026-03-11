/**
 * Owner dashboard home. Server fetches data, client renders @repo/ui.
 */
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { OwnerDashboardClient } from './OwnerDashboardClient';

export const dynamic = 'force-dynamic';

export default async function OwnerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'owner') redirect('/login');

  const db = getDb();
  const userId = session.user.id;
  const services = await db
    .select()
    .from(schema.services)
    .where(eq(schema.services.userId, userId));
  const staffList = await db.select().from(schema.staff).where(eq(schema.staff.userId, userId));
  const allBookings = await db.select().from(schema.bookings);
  const bookings = allBookings.filter((b) => staffList.some((s) => s.id === b.staffId));
  const upcoming = bookings.filter(
    (b) => new Date(b.startAt) >= new Date() && b.status === 'confirmed'
  );

  return (
    <OwnerDashboardClient
      servicesCount={services.length}
      staffCount={staffList.length}
      upcomingCount={upcoming.length}
    />
  );
}
