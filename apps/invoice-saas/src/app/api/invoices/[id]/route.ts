/**
 * Single invoice API.
 * GET    /api/invoices/:id   -> get invoice + items (owned by current user)
 * PATCH  /api/invoices/:id   -> update basic fields
 * DELETE /api/invoices/:id   -> delete invoice
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { and, eq } from 'drizzle-orm';

const updateInvoiceSchema = z.object({
  clientName: z.string().min(1).max(255).optional(),
  clientEmail: z.string().email().optional(),
  currency: z.string().min(3).max(3).optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  dueDate: z.string().optional(),
});

async function getOwnedInvoice(userId: string, invoiceId: string) {
  const db = getDb();
  const [invoice] = await db
    .select()
    .from(schema.invoices)
    .where(and(eq(schema.invoices.id, invoiceId), eq(schema.invoices.userId, userId)));

  if (!invoice) return null;

  const items = await db
    .select()
    .from(schema.invoiceItems)
    .where(eq(schema.invoiceItems.invoiceId, invoice.id));

  return { invoice, items };
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await getOwnedInvoice(session.user.id, params.id);
  if (!result) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(result);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateInvoiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = { ...parsed.data };

  if (updates.dueDate) {
    const due = new Date(updates.dueDate as string);
    if (Number.isNaN(due.getTime())) {
      return NextResponse.json({ error: 'Invalid due date' }, { status: 400 });
    }
    updates.dueDate = due;
  }

  const db = getDb();
  const result = await db
    .update(schema.invoices)
    .set(updates)
    .where(and(eq(schema.invoices.id, params.id), eq(schema.invoices.userId, session.user.id)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ invoice: result[0] });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const result = await db
    .delete(schema.invoices)
    .where(and(eq(schema.invoices.id, params.id), eq(schema.invoices.userId, session.user.id)))
    .returning({ id: schema.invoices.id });

  if (result.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ deleted: true });
}
