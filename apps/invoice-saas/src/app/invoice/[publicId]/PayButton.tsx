'use client';

import { useState, useCallback } from 'react';
import { Button } from '@repo/ui';
import { useToast } from '@repo/ui/toast';

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      amount: number;
      currency: string;
      order_id: string;
      name?: string;
      description?: string;
      handler: (response: { razorpay_payment_id: string }) => void;
      modal?: { ondismiss: () => void };
    }) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<NonNullable<typeof window.Razorpay>> {
  if (typeof window === 'undefined') return Promise.reject(new Error('No window'));
  if (window.Razorpay) return Promise.resolve(window.Razorpay!);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) resolve(window.Razorpay);
      else reject(new Error('Razorpay not available on window'));
    };
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

export function PayButton({ publicId }: { publicId: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePay = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error ?? 'Checkout failed');
      }

      if (data.provider === 'stripe' && data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.provider === 'razorpay' && data.keyId && data.orderId) {
        const RazorpayCtor = await loadRazorpayScript();
        const rzp = new RazorpayCtor({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          order_id: data.orderId,
          name: data.name,
          description: data.description,
          handler() {
            window.location.href = data.successUrl ?? `/invoice/${publicId}?paid=1`;
          },
          modal: {
            ondismiss() {
              setLoading(false);
            },
          },
        });
        rzp.open();
        return;
      }

      throw new Error('No payment URL or Razorpay data returned');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [publicId, toast]);

  return (
    <Button onClick={handlePay} loading={loading} className="w-full sm:w-auto">
      Pay now
    </Button>
  );
}
