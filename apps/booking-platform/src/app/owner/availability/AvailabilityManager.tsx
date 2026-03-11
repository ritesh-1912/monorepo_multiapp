'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Select,
} from '@repo/ui';
import { useToast } from '@repo/ui/toast';

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

type Staff = { id: string; name: string };
type Availability = {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export function AvailabilityManager({
  staff,
  initialAvailability,
}: {
  staff: Staff[];
  initialAvailability: Availability[];
}) {
  const [avail, setAvail] = useState(initialAvailability);
  const [staffId, setStaffId] = useState(staff[0]?.id ?? '');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (loading || !staffId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, dayOfWeek, startTime, endTime }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? 'Failed');
      }
      const { availability: row } = await res.json();
      setAvail((a) => [...a, row]);
      toast('Availability added', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Error', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (staff.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Add staff first, then set their availability.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Add slot</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-4">
            <div>
              <Label>Staff</Label>
              <Select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="mt-1 w-40"
              >
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Day</Label>
              <Select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="mt-1 w-32"
              >
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>From</Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-28"
              />
            </div>
            <div>
              <Label>To</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-28"
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
          <CardTitle>Current availability</CardTitle>
        </CardHeader>
        <CardContent>
          {avail.length === 0 ? (
            <p className="text-muted-foreground">None. Add slots above.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {avail.map((a) => {
                const s = staff.find((x) => x.id === a.staffId);
                const day = DAYS.find((d) => d.value === a.dayOfWeek)?.label ?? a.dayOfWeek;
                return (
                  <li key={a.id}>
                    {s?.name} — {day} {a.startTime}–{a.endTime}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
