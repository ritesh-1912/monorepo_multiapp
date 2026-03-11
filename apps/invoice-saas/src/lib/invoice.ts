/**
 * Helpers for loading invoice by publicId (used by public page and checkout).
 */
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function getInvoiceByPublicId(publicId: string) {
  const db = getDb();
  const [invoice] = await db
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.publicId, publicId));

  if (!invoice) return null;
  if (invoice.status === 'cancelled') return null;

  const items = await db
    .select()
    .from(schema.invoiceItems)
    .where(eq(schema.invoiceItems.invoiceId, invoice.id))
    .orderBy(schema.invoiceItems.order);

  const totalCents = items.reduce((sum, row) => sum + row.quantity * row.unitAmountCents, 0);

  return {
    invoice: {
      id: invoice.id,
      publicId: invoice.publicId,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      status: invoice.status,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
    },
    items: items.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unitAmountCents: i.unitAmountCents,
      totalCents: i.quantity * i.unitAmountCents,
    })),
    totalCents,
  };
}
