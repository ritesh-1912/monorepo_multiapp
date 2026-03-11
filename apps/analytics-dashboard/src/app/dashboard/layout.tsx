/**
 * Dashboard layout: 240px sidebar, top bar, 12-col content. Dark-first.
 */
import Link from 'next/link';
import { LogoutButton } from '@/components/LogoutButton';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '▣' },
  { href: '/dashboard/views', label: 'Saved views', icon: '◇' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className="fixed left-0 top-0 z-30 flex h-full w-[240px] flex-col border-r border-border bg-surface"
        style={{ boxShadow: '1px 0 0 0 rgba(255,255,255,0.06)' }}
      >
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link
            href="/dashboard"
            className="font-display text-xl font-medium tracking-heading text-foreground"
          >
            Analytics
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {nav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-fast hover:bg-surface-hover hover:text-foreground"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <span className="text-base opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <a
            href="/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-fast hover:bg-surface-hover hover:text-foreground"
          >
            <span className="text-base opacity-70">⎋</span>
            API docs
          </a>
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
