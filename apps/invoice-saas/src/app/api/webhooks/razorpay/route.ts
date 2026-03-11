/**
 * Razorpay webhook handler. Verifies signature and marks invoice paid on payment.captured.
 */
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { getRazorpay } from '@/lib/razorpay';

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not set' }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const expectedSig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  if (expectedSig !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let payload: {
    event: string;
    payload?: {
      payment?: { entity?: { id: string; order_id: string; amount: number; currency: string } };
      order?: { entity?: { notes?: Record<string, string> } };
    };
  };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (payload.event !== 'payment.captured') {
    return NextResponse.json({ received: true });
  }

  const paymentEntity = payload.payload?.payment?.entity;
  if (!paymentEntity?.order_id) {
    return NextResponse.json({ error: 'Missing order_id in payment' }, { status: 400 });
  }

  const razorpay = getRazorpay();
  const order = await razorpay.orders.fetch(paymentEntity.order_id);
  const notes = (order as { notes?: Record<string, string> }).notes;
  const invoiceId = notes?.invoiceId;
  if (!invoiceId) {
    return NextResponse.json({ error: 'Missing invoiceId in order notes' }, { status: 400 });
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

  const amountPaise = paymentEntity.amount ?? 0;
  const currency = (paymentEntity.currency ?? invoice.currency ?? 'INR').toUpperCase();

  await db.insert(schema.razorpayPayments).values({
    invoiceId: invoice.id,
    razorpayOrderId: paymentEntity.order_id,
    razorpayPaymentId: paymentEntity.id,
    amountPaise,
    currency,
    status: 'captured',
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
