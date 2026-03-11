/**
 * Public invoice by publicId. No auth required. Used for public invoice page and checkout.
 */
import { NextResponse } from 'next/server';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET(_request: Request, { params }: { params: { publicId: string } }) {
  const db = getDb();
  const [invoice] = await db
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.publicId, params.publicId));

  if (!invoice) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (invoice.status === 'cancelled') {
    return NextResponse.json({ error: 'Invoice is cancelled' }, { status: 410 });
  }

  const items = await db
    .select()
    .from(schema.invoiceItems)
    .where(eq(schema.invoiceItems.invoiceId, invoice.id))
    .orderBy(schema.invoiceItems.order);

  const totalCents = items.reduce((sum, row) => sum + row.quantity * row.unitAmountCents, 0);

  return NextResponse.json({
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
  });
}
