/**
 * Stripe server-side client. Uses STRIPE_SECRET_KEY from env.
 * Used for Checkout Session creation and webhook verification.
 */
import Stripe from 'stripe';

function getSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !key.startsWith('sk_')) {
    throw new Error('STRIPE_SECRET_KEY is not set or invalid');
  }
  return key;
}

export function getStripe(): Stripe {
  return new Stripe(getSecretKey(), { apiVersion: '2023-10-16' });
}

export function getStripeIfConfigured(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || !key.startsWith('sk_')) return null;
  return new Stripe(key, { apiVersion: '2023-10-16' });
}
