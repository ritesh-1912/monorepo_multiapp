'use client';
/**
 * New invoice page. Renders the NewInvoiceForm client component.
 */
import Link from 'next/link';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { NewInvoiceForm } from './NewInvoiceForm';

export default function NewInvoicePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">New invoice</h1>
          <p className="text-muted-foreground">Create a new invoice for your client.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Invoice details</CardTitle>
          <p className="text-sm text-muted-foreground">
            Client information and first line item. More advanced editing can be added later.
          </p>
        </CardHeader>
        <CardContent>
          <NewInvoiceForm />
        </CardContent>
      </Card>
    </div>
  );
}
