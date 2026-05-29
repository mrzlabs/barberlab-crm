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
    <div className="surface-grid min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-cyan-300 shadow-lg shadow-cyan-950/15">
              BL
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">BarberLab CRM</p>
              <h1 className="text-lg font-black tracking-tight">{title}</h1>
            </div>
          </div>
          <span className="rounded-full border bg-slate-50 px-3 py-1 text-xs font-black uppercase text-slate-700">{role}</span>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-4">
          {nav.map((item) => (
            <Link className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
