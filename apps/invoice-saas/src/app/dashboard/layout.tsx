/**
 * Dashboard layout: 240px sidebar (dark blue-gray), main content.
 */
import Link from 'next/link';
import { LogoutButton } from '@/components/LogoutButton';

const nav = [
  { href: '/dashboard', label: 'Invoices' },
  { href: '/dashboard/invoices/new', label: 'New invoice' },
  { href: '/dashboard/settings', label: 'Settings' },
  { href: '/dashboard/audit-log', label: 'Audit log' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className="fixed left-0 top-0 z-30 flex h-full w-[240px] flex-col border-r border-border bg-surface"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link
            href="/dashboard"
            className="font-display text-xl font-medium tracking-heading text-foreground"
          >
            Invoice
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2.5 text-base font-medium text-muted-foreground transition-colors duration-fast hover:bg-surface-hover hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <LogoutButton />
        </div>
      </aside>
      <div className="flex flex-1 flex-col pl-[240px]">
        <main className="min-h-screen overflow-auto">
          <div className="mx-auto max-w-content px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
