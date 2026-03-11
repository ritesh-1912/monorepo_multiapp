'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

type OwnerDashboardClientProps = {
  servicesCount: number;
  staffCount: number;
  upcomingCount: number;
};

export function OwnerDashboardClient({
  servicesCount,
  staffCount,
  upcomingCount,
}: OwnerDashboardClientProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Manage services, staff, and bookings.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Services</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">{servicesCount}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">{staffCount}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-semibold">{upcomingCount}</span>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Quick start</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add a service and staff, then set weekly availability. Customers can then book via the
            public booking page.
          </p>
        </CardHeader>
      </Card>
    </div>
  );
}
