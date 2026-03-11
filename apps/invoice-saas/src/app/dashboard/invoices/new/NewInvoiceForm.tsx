/**
 * Client-side form for creating a new invoice via the /api/invoices endpoint.
 */
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@repo/ui';
import { useToast } from '@repo/ui/toast';

export function NewInvoiceForm() {
  const router = useRouter();
  const { toast } = useToast();

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitAmount, setUnitAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      const payload = {
        clientName,
        clientEmail,
        dueDate,
        currency: 'USD',
        lineItems: [
          {
            description,
            quantity,
            unitAmountCents: Math.round(unitAmount * 100),
          },
        ],
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? 'Failed to create invoice');
      }

      toast('Invoice created', 'success');
      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="clientName">Client name</Label>
          <Input
            id="clientName"
            required
            placeholder="Acme Inc."
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="clientEmail">Client email</Label>
          <Input
            id="clientEmail"
            type="email"
            required
            placeholder="billing@acme.com"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Due date</Label>
          <Input
            id="dueDate"
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="description">Line item description</Label>
          <Input
            id="description"
            required
            placeholder="Design work"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              required
              value={Number.isNaN(quantity) ? '' : quantity}
              onChange={(e) => setQuantity(Number(e.target.value) || 1)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unitAmount">Unit amount (USD)</Label>
            <Input
              id="unitAmount"
              type="number"
              min={0}
              step={0.01}
              required
              value={Number.isNaN(unitAmount) ? '' : unitAmount}
              onChange={(e) => setUnitAmount(Number(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={loading}>
          Save as draft
        </Button>
      </div>
    </form>
  );
}
