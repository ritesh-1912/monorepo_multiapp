/**
 * Dashboard home: server fetches data, client component renders @repo/ui.
 */
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { DashboardClient, type InvoiceRow } from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login');
  }

  const db = getDb();
  const userId = session.user.id;

  const invoices = await db
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.userId, userId));

  const totalSent = invoices.filter((i) => i.status !== 'draft').length;
  const totalPaid = invoices.filter((i) => i.status === 'paid').length;
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').length;
  const thisMonth = invoices.filter((i) => {
    if (!i.createdAt) return false;
    const now = new Date();
    return (
      i.createdAt.getUTCFullYear() === now.getUTCFullYear() &&
      i.createdAt.getUTCMonth() === now.getUTCMonth()
    );
  }).length;

  const kpis = [
    { label: 'Total sent', value: totalSent, sub: `${totalSent} invoices` },
    { label: 'Paid', value: totalPaid, sub: `${totalPaid} paid` },
    { label: 'Overdue', value: totalOverdue, sub: `${totalOverdue} overdue` },
    { label: 'Created this month', value: thisMonth, sub: `${thisMonth} this month` },
  ];

  const invoiceRows: InvoiceRow[] = invoices.map((i) => ({
    id: i.id,
    publicId: i.publicId,
    clientName: i.clientName,
    status: i.status,
    dueDate: i.dueDate ? i.dueDate.toISOString() : null,
    createdAt: i.createdAt ? i.createdAt.toISOString() : null,
  }));

  return <DashboardClient kpis={kpis} invoices={invoiceRows} />;
}
