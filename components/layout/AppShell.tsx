import Link from "next/link";
import type { UserRole } from "@/lib/auth/roles";

type NavItem = {
  href: string;
  label: string;
};

export function AppShell({
  role,
  title,
  nav,
  children,
}: {
  role: UserRole;
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">BarberLab CRM</p>
            <h1 className="text-lg font-bold">{title}</h1>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase">{role}</span>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3">
          {nav.map((item) => (
            <Link className="whitespace-nowrap rounded-lg border bg-white px-3 py-2 text-sm font-medium" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
