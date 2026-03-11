/**
 * Booking confirmation page. Server loads booking, client renders @repo/ui.
 */
import { notFound } from 'next/navigation';
import { getBookingById } from '@/lib/booking';
import { ConfirmationClient, type ConfirmationData } from '../ConfirmationClient';

export const dynamic = 'force-dynamic';

export default async function ConfirmationPage({ params }: { params: { id: string } }) {
  const booking = await getBookingById(params.id);
  if (!booking) notFound();

  const data: ConfirmationData = {
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    serviceName: booking.serviceName ?? null,
    staffName: booking.staffName ?? null,
    startAt:
      booking.startAt instanceof Date ? booking.startAt.toISOString() : String(booking.startAt),
    endAt: booking.endAt instanceof Date ? booking.endAt.toISOString() : String(booking.endAt),
  };

  return <ConfirmationClient booking={data} />;
}
