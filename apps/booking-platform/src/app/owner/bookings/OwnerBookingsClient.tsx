'use client';

import { Card, CardContent, CardHeader, CardTitle, Badge } from '@repo/ui';

export type BookingRow = {
  id: string;
  customerName: string;
  customerEmail: string;
  startAt: string;
  status: string;
};

type OwnerBookingsClientProps = {
  bookings: BookingRow[];
};

export function OwnerBookingsClient({ bookings }: OwnerBookingsClientProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Bookings</h1>
        <p className="text-muted-foreground">All bookings for your staff.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground">No bookings yet.</p>
          ) : (
            <ul className="space-y-2">
              {bookings.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-border px-3 py-2"
                >
                  <span>
                    <strong>{b.customerName}</strong> — {b.customerEmail}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(b.startAt).toLocaleString()}
                  </span>
                  <Badge variant={b.status === 'confirmed' ? 'success' : 'secondary'}>
                    {b.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
