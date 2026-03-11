/**
 * Create checkout for an invoice. Prefers Razorpay if configured (India), else Stripe.
 * Returns { provider: 'razorpay', keyId, orderId, amount, currency, ... } or { provider: 'stripe', url }.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getStripeIfConfigured } from '@/lib/stripe';
import { getRazorpayIfConfigured, getRazorpayKeyId } from '@/lib/razorpay';

const bodySchema = z.object({ publicId: z.string().min(1) });

export async function POST(request: Request) {
  const razorpay = getRazorpayIfConfigured();
  const stripe = getStripeIfConfigured();
  if (!razorpay && !stripe) {
    return NextResponse.json(
      { error: 'Payments are not configured. Set Razorpay or Stripe env vars.' },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const db = getDb();
  const [invoice] = await db
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.publicId, parsed.data.publicId));

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  if (invoice.status === 'paid') {
    return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 });
  }

  if (invoice.status === 'cancelled') {
    return NextResponse.json({ error: 'Invoice is cancelled' }, { status: 400 });
  }

  const items = await db
    .select()
    .from(schema.invoiceItems)
    .where(eq(schema.invoiceItems.invoiceId, invoice.id))
    .orderBy(schema.invoiceItems.order);

  if (items.length === 0) {
    return NextResponse.json({ error: 'Invoice has no line items' }, { status: 400 });
  }

  const totalPaise = items.reduce((sum, i) => sum + i.quantity * i.unitAmountCents, 0);
  const baseUrl =
    process.env.NEXTAUTH_URL ?? request.headers.get('origin') ?? 'http://localhost:3000';

  // Prefer Razorpay (India-friendly)
  if (razorpay) {
    const keyId = getRazorpayKeyId();
    if (!keyId) {
      return NextResponse.json({ error: 'Razorpay key not set' }, { status: 503 });
    }
    const order = await razorpay.orders.create({
      amount: totalPaise, // Razorpay expects paise for INR (smallest unit)
      currency: (invoice.currency ?? 'INR').toUpperCase(),
      receipt: invoice.publicId,
      notes: {
        invoiceId: invoice.id,
        publicId: invoice.publicId,
      },
    });
    const orderId = typeof order.id === 'string' ? order.id : (order as { id: string }).id;
    return NextResponse.json({
      provider: 'razorpay',
      keyId,
      orderId,
      amount: totalPaise,
      currency: (invoice.currency ?? 'INR').toUpperCase(),
      publicId: invoice.publicId,
      name: invoice.clientName,
      description: `Invoice ${invoice.publicId}`,
      successUrl: `${baseUrl}/invoice/${invoice.publicId}?paid=1`,
      cancelUrl: `${baseUrl}/invoice/${invoice.publicId}`,
    });
  }

  // Stripe
  const session = await stripe!.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: items.map((item) => ({
      price_data: {
        currency: (invoice.currency ?? 'usd').toLowerCase(),
        product_data: {
          name: item.description,
          description: item.quantity > 1 ? `Qty: ${item.quantity}` : undefined,
        },
        unit_amount: item.unitAmountCents,
      },
      quantity: item.quantity,
    })),
    success_url: `${baseUrl}/invoice/${invoice.publicId}?paid=1`,
    cancel_url: `${baseUrl}/invoice/${invoice.publicId}`,
    metadata: {
      invoiceId: invoice.id,
      publicId: invoice.publicId,
    },
  });

  return NextResponse.json({ provider: 'stripe', url: session.url });
}
