/**
 * Owner bookings list. Server fetches data, client renders @repo/ui.
 */
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { OwnerBookingsClient, type BookingRow } from './OwnerBookingsClient';

export const dynamic = 'force-dynamic';

export default async function OwnerBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'owner') redirect('/login');

  const db = getDb();
  const staffList = await db
    .select()
    .from(schema.staff)
    .where(eq(schema.staff.userId, session.user.id));
  const staffIds = new Set(staffList.map((s) => s.id));
  const allBookings = await db.select().from(schema.bookings);
  const bookings = allBookings
    .filter((b) => staffIds.has(b.staffId))
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  const rows: BookingRow[] = bookings.map((b) => ({
    id: b.id,
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    startAt: new Date(b.startAt).toISOString(),
    status: b.status,
  }));

  return <OwnerBookingsClient bookings={rows} />;
}
