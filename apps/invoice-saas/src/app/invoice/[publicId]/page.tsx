/**
 * Public invoice page. View by publicId (no auth). Shows client, line items, total, and Pay button.
 */
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { getInvoiceByPublicId } from '@/lib/invoice';
import { PayButton } from './PayButton';

export const dynamic = 'force-dynamic';

export default async function PublicInvoicePage({
  params,
  searchParams,
}: {
  params: { publicId: string };
  searchParams: { paid?: string };
}) {
  const data = await getInvoiceByPublicId(params.publicId);
  if (!data) notFound();

  const { invoice, items, totalCents } = data;
  const currency = invoice.currency ?? 'USD';
  const paid = searchParams.paid === '1';

  function formatMoney(cents: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(cents / 100);
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="mx-auto max-w-2xl px-4">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle>Invoice</CardTitle>
            <p className="text-sm text-muted-foreground">
              {invoice.clientName} · {invoice.clientEmail}
            </p>
            <p className="text-sm text-muted-foreground">
              Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}
              {' · '}
              Status: <span className="font-medium capitalize">{invoice.status}</span>
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium text-right">Qty</th>
                  <th className="pb-2 font-medium text-right">Amount</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map(
                  (
                    item: {
                      description: string;
                      quantity: number;
                      unitAmountCents: number;
                      totalCents: number;
                    },
                    i: number
                  ) => (
                    <tr key={i} className="border-b border-border">
                      <td className="py-2">{item.description}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">{formatMoney(item.unitAmountCents)}</td>
                      <td className="py-2 text-right">{formatMoney(item.totalCents)}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <p className="text-lg font-semibold">Total: {formatMoney(totalCents)}</p>
            </div>

            {paid && (
              <p className="mt-4 rounded-md bg-emerald-500/10 p-3 text-center text-sm text-emerald-700 dark:text-emerald-400">
                Thank you. This invoice has been paid.
              </p>
            )}

            {invoice.status !== 'paid' && !paid && (
              <div className="mt-6">
                <PayButton publicId={invoice.publicId} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
