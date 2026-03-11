/**
 * Invoices collection API.
 * GET    /api/invoices   -> list invoices for current user
 * POST   /api/invoices   -> create invoice + items
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

const lineItemSchema = z.object({
  description: z.string().min(1).max(255),
  quantity: z.number().int().positive(),
  unitAmountCents: z.number().int().positive(),
});

const createInvoiceSchema = z.object({
  clientName: z.string().min(1).max(255),
  clientEmail: z.string().email(),
  currency: z.string().min(3).max(3).default('USD'),
  dueDate: z.string(), // ISO string or date-only; validated when constructing Date
  lineItems: z.array(lineItemSchema).min(1),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const userId = session.user.id;

  const invoices = await db
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.userId, userId));

  return NextResponse.json({ invoices });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createInvoiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { clientName, clientEmail, currency, dueDate, lineItems } = parsed.data;

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) {
    return NextResponse.json({ error: 'Invalid due date' }, { status: 400 });
  }

  const db = getDb();
  const userId = session.user.id;

  const publicId = `inv_${crypto.randomUUID()}`;

  const [invoice] = await db
    .insert(schema.invoices)
    .values({
      userId,
      publicId,
      clientName,
      clientEmail,
      currency,
      dueDate: due,
    })
    .returning();

  await db.insert(schema.invoiceItems).values(
    lineItems.map((item, index) => ({
      invoiceId: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unitAmountCents: item.unitAmountCents,
      order: index,
    }))
  );

  return NextResponse.json({ invoiceId: invoice.id, publicId: invoice.publicId }, { status: 201 });
}
