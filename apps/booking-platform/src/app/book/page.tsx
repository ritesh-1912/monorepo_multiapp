/**
 * Public booking flow: service → staff → date → time → details → confirm.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@repo/ui';
import { useToast } from '@repo/ui/toast';

type Service = { id: string; name: string; durationMinutes: number };
type Staff = { id: string; name: string };

export default function BookPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetch('/api/public/services')
      .then((r) => r.json())
      .then((d) => setServices(d.services ?? []))
      .catch(() => setServices([]));
    fetch('/api/public/staff')
      .then((r) => r.json())
      .then((d) => setStaff(d.staff ?? []))
      .catch(() => setStaff([]));
  }, []);

  useEffect(() => {
    if (step !== 4 || !selectedService || !selectedStaff || !date) return;
    setLoadingSlots(true);
    fetch(`/api/slots?serviceId=${selectedService.id}&staffId=${selectedStaff.id}&date=${date}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [step, selectedService, selectedStaff, date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !selectedService ||
      !selectedStaff ||
      !selectedSlot ||
      !customerName ||
      !customerEmail ||
      loading
    )
      return;
    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedService.id,
          staffId: selectedStaff.id,
          startAt: selectedSlot,
          customerName,
          customerEmail,
          notes: notes || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Booking failed');
      router.push(`/book/confirmation/${data.booking.id}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Booking failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  const canNext = () => {
    if (step === 1) return selectedService;
    if (step === 2) return selectedStaff;
    if (step === 3) return date;
    if (step === 4) return selectedSlot;
    return true;
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="mx-auto max-w-lg px-4">
        <h1 className="mb-8 text-2xl font-semibold text-foreground">Book an appointment</h1>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Step {step} of 5 — {step === 1 && 'Service'}
              {step === 2 && 'Staff'}
              {step === 3 && 'Date'}
              {step === 4 && 'Time'}
              {step === 5 && 'Your details'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-2">
                {services.length === 0 && (
                  <p className="text-muted-foreground">No services available.</p>
                )}
                {services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedService(s)}
                    className={`block w-full rounded border px-3 py-2 text-left ${selectedService?.id === s.id ? 'border-primary bg-primary/10' : 'border-border'}`}
                  >
                    {s.name} ({s.durationMinutes} min)
                  </button>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2">
                {staff.length === 0 && <p className="text-muted-foreground">No staff available.</p>}
                {staff.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStaff(s)}
                    className={`block w-full rounded border px-3 py-2 text-left ${selectedStaff?.id === s.id ? 'border-primary bg-primary/10' : 'border-border'}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="mt-1"
                />
              </div>
            )}

            {step === 4 && (
              <div>
                {loadingSlots && <p className="text-muted-foreground">Loading slots…</p>}
                {!loadingSlots && slots.length === 0 && date && (
                  <p className="text-muted-foreground">No slots available this day.</p>
                )}
                <div className="mt-2 flex flex-wrap gap-2">
                  {slots.map((slot) => {
                    const start = new Date(slot.start);
                    const label = start.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    });
                    return (
                      <button
                        key={slot.start}
                        type="button"
                        onClick={() => setSelectedSlot(slot.start)}
                        className={`rounded border px-3 py-1.5 text-sm ${selectedSlot === slot.start ? 'border-primary bg-primary/10' : 'border-border'}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 5 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" loading={loading}>
                  Confirm booking
                </Button>
              </form>
            )}

            {step < 5 && (
              <div className="mt-4 flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep((s) => s - 1)}
                  disabled={step === 1}
                >
                  Back
                </Button>
                <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          <a href="/" className="hover:underline">
            ← Back to home
          </a>
        </p>
      </div>
    </div>
  );
}
