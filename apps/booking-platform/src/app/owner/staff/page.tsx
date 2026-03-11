/**
 * Owner staff list and add form.
 */
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { StaffManager } from './StaffManager';

export const dynamic = 'force-dynamic';

export default async function OwnerStaffPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'owner') redirect('/login');

  const db = getDb();
  const staff = await db
    .select()
    .from(schema.staff)
    .where(eq(schema.staff.userId, session.user.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Staff</h1>
        <p className="text-muted-foreground">Staff members who can be booked.</p>
      </div>
      <StaffManager initialStaff={staff} />
    </div>
  );
}
