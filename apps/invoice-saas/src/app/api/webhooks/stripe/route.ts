/**
 * Stripe webhook handler. Verifies signature and marks invoice paid on checkout.session.completed.
 */
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not set' }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = await import('@/lib/stripe').then((m) => m.getStripe());
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const invoiceId = session.metadata?.invoiceId;
  if (!invoiceId) {
    return NextResponse.json({ error: 'Missing invoiceId in metadata' }, { status: 400 });
  }

  const db = getDb();
  const [invoice] = await db
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.id, invoiceId));

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  if (invoice.status === 'paid') {
    return NextResponse.json({ received: true });
  }

  const amountCents = session.amount_total ?? 0;
  const currency = (session.currency ?? invoice.currency).toUpperCase();

  await db.insert(schema.stripePayments).values({
    invoiceId: invoice.id,
    stripeSessionId: session.id,
    amountCents,
    currency,
    status: 'succeeded',
  });

  await db
    .update(schema.invoices)
    .set({
      status: 'paid',
      paidAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.invoices.id, invoiceId));

  return NextResponse.json({ received: true });
}
