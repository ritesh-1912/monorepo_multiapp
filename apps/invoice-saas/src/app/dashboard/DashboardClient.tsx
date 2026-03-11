'use client';

/**
 * Invoice dashboard: stats with status border, table with spec badge colors.
 */
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';

export type InvoiceRow = {
  id: string;
  publicId: string;
  clientName: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string | null;
  createdAt: string | null;
};

type DashboardClientProps = {
  kpis: { label: string; value: number; sub?: string }[];
  invoices: InvoiceRow[];
};

const STAT_BORDER: Record<string, string> = {
  'Total sent': '#4F9EFF',
  Paid: '#34D399',
  Overdue: '#FB7185',
  'Created this month': '#64748B',
};

const STATUS_BADGE: Record<string, { bg: string; text: string }> = {
  paid: { bg: '#064E3B', text: '#34D399' },
  sent: { bg: '#1E3A5F', text: '#60A5FA' },
  overdue: { bg: '#4C0519', text: '#FB7185' },
  draft: { bg: '#1C1917', text: '#A8A29E' },
  cancelled: { bg: '#1C1917', text: '#A8A29E' },
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_BADGE[status.toLowerCase()] ?? STATUS_BADGE.draft;
  return (
    <span
      className="inline-flex items-center rounded-[4px] px-2.5 py-1 text-sm font-medium"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {status}
    </span>
  );
}

export function DashboardClient({ kpis, invoices }: DashboardClientProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-heading text-foreground">
          Dashboard
        </h1>
        <p className="mt-2 text-base text-muted-foreground">Manage your invoices and overview.</p>
      </div>

      {/* Stats row: status-colored left border 4px */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card
            key={kpi.label}
            className="overflow-hidden border-border bg-surface"
            style={{
              boxShadow: 'var(--shadow-card)',
              borderLeftWidth: '4px',
              borderLeftColor: STAT_BORDER[kpi.label] ?? 'var(--border)',
            }}
          >
            <CardContent className="flex min-h-[120px] flex-col justify-between p-6 pt-6">
              <div>
                <p className="text-sm font-medium uppercase leading-tight tracking-wider text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="mt-2 font-display text-3xl font-medium tabular-nums leading-none tracking-heading text-foreground lg:text-4xl">
                  {kpi.value}
                </p>
              </div>
              {kpi.sub && (
                <p className="mt-3 text-sm leading-tight text-muted-foreground">{kpi.sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-surface" style={{ boxShadow: 'var(--shadow-card)' }}>
        <CardHeader className="border-b border-border pb-5">
          <CardTitle className="font-display text-lg font-medium tracking-heading leading-tight">
            Invoices
          </CardTitle>
          <p className="mt-1.5 text-base leading-snug text-muted-foreground">
            Recent invoices. Create a new one from the sidebar.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="border-border p-8 text-center text-base text-muted-foreground">
              No invoices yet. Create your first invoice from the sidebar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-surface hover:bg-surface">
                    <TableHead className="sticky top-0 z-10 h-12 border-b border-border bg-surface px-4 py-0 text-left align-middle text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      Client
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 h-12 border-b border-border bg-surface px-4 py-0 text-left align-middle text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 h-12 border-b border-border bg-surface px-4 py-0 text-left align-middle text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      Due date
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 h-12 border-b border-border bg-surface px-4 py-0 text-left align-middle text-sm font-medium uppercase tracking-wider text-muted-foreground">
                      Created
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 h-12 w-0 border-b border-border bg-surface px-4 py-0 text-left align-middle text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv, i) => (
                    <TableRow
                      key={inv.id}
                      className="border-border transition-colors duration-fast hover:bg-[rgba(255,255,255,0.03)]"
                      style={{
                        backgroundColor: i % 2 === 1 ? 'rgba(255,255,255,0.04)' : undefined,
                      }}
                    >
                      <TableCell className="px-4 py-4 text-left align-middle text-base font-medium">
                        {inv.clientName}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-left align-middle">
                        <StatusBadge status={inv.status} />
                      </TableCell>
                      <TableCell className="px-4 py-4 text-left align-middle text-base text-muted-foreground">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-left align-middle text-base text-muted-foreground">
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-left align-middle">
                        <Link
                          href={`/invoice/${inv.publicId}`}
                          className="text-base font-medium text-primary hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
