'use client';
/**
 * Audit log page: list of recent actions. Placeholder until DB and audit log are implemented.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';

export default function AuditLogPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Audit log</h1>
        <p className="mt-1 text-base text-muted-foreground">
          Recent actions on your account and invoices.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border p-8 text-center text-base text-muted-foreground">
            No activity yet. Actions will appear here once you create and send invoices.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
