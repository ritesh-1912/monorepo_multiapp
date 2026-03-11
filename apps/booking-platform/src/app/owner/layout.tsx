/**
 * Owner dashboard layout. Protected by middleware.
 */
import Link from 'next/link';
import { LogoutButton } from '@/components/LogoutButton';

const nav = [
  { href: '/owner', label: 'Dashboard' },
  { href: '/owner/services', label: 'Services' },
  { href: '/owner/staff', label: 'Staff' },
  { href: '/owner/availability', label: 'Availability' },
  { href: '/owner/bookings', label: 'Bookings' },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="flex w-56 flex-col border-r border-border bg-card">
        <div className="flex h-16 shrink-0 items-center border-b border-border px-4">
          <Link href="/owner" className="font-semibold text-foreground">
            Booking
          </Link>
        </div>
        <nav className="flex-1 p-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="shrink-0 border-t border-border p-2">
          <LogoutButton />
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
