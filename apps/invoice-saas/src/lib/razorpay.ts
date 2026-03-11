/**
 * Razorpay server-side client. Uses RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from env.
 * Used for Order creation and (in webhook) payment verification.
 */
import Razorpay from 'razorpay';

function getConfig(): { keyId: string; keySecret: string } {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set');
  }
  return { keyId, keySecret };
}

export function getRazorpay(): Razorpay {
  const { keyId, keySecret } = getConfig();
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function getRazorpayIfConfigured(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function getRazorpayKeyId(): string | null {
  return process.env.RAZORPAY_KEY_ID ?? null;
}
