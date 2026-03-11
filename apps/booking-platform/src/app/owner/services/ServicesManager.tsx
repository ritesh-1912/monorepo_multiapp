'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@repo/ui';
import { useToast } from '@repo/ui/toast';

type Service = { id: string; name: string; durationMinutes: number };

export function ServicesManager({ initialServices }: { initialServices: Service[] }) {
  const [services, setServices] = useState(initialServices);
  const [name, setName] = useState('');
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (loading || !name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), durationMinutes: duration }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? 'Failed');
      }
      const { service } = await res.json();
      setServices((s) => [...s, service]);
      setName('');
      setDuration(60);
      toast('Service added', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Add service</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Consultation"
                className="mt-1 w-48"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                min={15}
                step={15}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) || 60)}
                className="mt-1 w-24"
              />
            </div>
            <Button type="submit" loading={loading}>
              Add
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>All services</CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-muted-foreground">No services yet.</p>
          ) : (
            <ul className="space-y-2">
              {services.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded border border-border px-3 py-2"
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="text-sm text-muted-foreground">{s.durationMinutes} min</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
