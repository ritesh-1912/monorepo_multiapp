/**
 * Main dashboard: top bar + metric cards + chart + table.
 */
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { DashboardClient } from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const from = new Date();
  from.setDate(from.getDate() - 30);
  const to = new Date();

  return (
    <div className="animate-fade-in">
      <DashboardClient
        defaultFrom={from.toISOString().slice(0, 10)}
        defaultTo={to.toISOString().slice(0, 10)}
        isAdmin={session.user.role === 'admin'}
      />
    </div>
  );
}
