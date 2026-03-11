'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

export type ConfirmationData = {
  customerName: string;
  customerEmail: string;
  serviceName: string | null;
  staffName: string | null;
  startAt: string;
  endAt: string;
};

type ConfirmationClientProps = {
  booking: ConfirmationData;
};

export function ConfirmationClient({ booking }: ConfirmationClientProps) {
  const start = new Date(booking.startAt);
  const end = new Date(booking.endAt);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Booking confirmed</CardTitle>
          <p className="text-sm text-muted-foreground">Thank you, {booking.customerName}.</p>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            <strong>{booking.serviceName}</strong> with {booking.staffName}
          </p>
          <p className="text-muted-foreground">
            {start.toLocaleString()} – {end.toLocaleTimeString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Confirmation sent to {booking.customerEmail}
          </p>
        </CardContent>
      </Card>
      <Link href="/" className="mt-6 text-sm text-primary hover:underline">
        ← Back to home
      </Link>
    </div>
  );
}
