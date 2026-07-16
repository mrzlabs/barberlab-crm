"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SignOutButton } from "@/components/layout/SignOutButton";
import {
  Activity,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FlaskConical,
  LayoutDashboard,
  Menu,
  Receipt,
  Settings,
  Users,
  X,
} from "lucide-react";
import type { CurrentProfile } from "@/lib/auth/session";

const NAV = [
  { href: "/super-admin/dashboard",      label: "Dashboard",          icon: LayoutDashboard },
  { href: "/super-admin/negocios",       label: "Negocios",           icon: Building2       },
  { href: "/super-admin/usuarios",       label: "Usuarios",           icon: Users           },
  { href: "/super-admin/planes",         label: "Planes",             icon: CreditCard      },
  { href: "/super-admin/facturacion",    label: "Facturación",        icon: Receipt         },
  { href: "/super-admin/configuracion",  label: "Configuración",      icon: Settings        },
  { href: "/super-admin/logs",           label: "Logs de actividad",  icon: Activity        },
];

export function SuperAdminChrome({
  children,
  demoMode = false,
  profile,
}: {
  children: React.ReactNode;
  demoMode?: boolean;
  profile?: CurrentProfile;
}) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="sa-shell ds-root min-h-dvh overflow-x-hidden bg-ds-canvas text-ds-fg" data-mode={demoMode ? "demo" : "produccion"} data-theme="light">

      {/* Mobile overlay */}
      {mobileOpen && (
        <button className="fixed inset-0 z-30 bg-ds-fg/40 lg:hidden" onClick={() => setMobileOpen(false)} type="button" aria-label="Cerrar menú" />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-ds-border bg-ds-surface transition-all duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${open ? "w-[min(17rem,88vw)] lg:w-[17rem]" : "w-[17rem] lg:w-[5rem]"}`}
      >
        {/* logo / header */}
        <div className="flex items-center justify-between gap-3 border-b border-ds-border p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-ds-primary text-[15px] font-bold text-white">O</div>
            {open && (
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ds-fg-muted">MRZLABS</p>
                <p className="truncate text-sm font-semibold text-ds-fg">SaaS Admin</p>
              </div>
            )}
          </div>
          <button
            className="hidden rounded-control border border-ds-border p-1.5 text-ds-fg-muted transition-colors hover:bg-ds-surface-2 hover:text-ds-fg lg:grid"
            onClick={() => setOpen((v) => !v)}
            type="button"
            aria-label="Contraer menú"
          >
            {open ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
          <button className="rounded-control border border-ds-border p-1.5 text-ds-fg-muted lg:hidden" onClick={() => setMobileOpen(false)} type="button">
            <X className="size-4" />
          </button>
        </div>

        {/* nav */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className={`mb-4 ${open ? "flex" : "flex justify-center"}`}>
            <span className="rounded-full border border-ds-border bg-ds-surface-2 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ds-fg-muted">
              {open ? "super_admin" : "SA"}
            </span>
          </div>

          <nav className="grid gap-0.5">
            {NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  onClick={() => setMobileOpen(false)}
                  className={`group flex w-full items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors ${open ? "justify-start" : "justify-center"} ${
                    isActive ? "bg-ds-primary-tint text-ds-primary" : "text-ds-fg-muted hover:bg-ds-surface-2 hover:text-ds-fg"
                  }`}
                >
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full ${isActive ? "bg-ds-primary text-white" : "bg-ds-surface-2 text-ds-fg-muted"}`}>
                    <Icon className="size-[16px]" />
                  </span>
                  {open && <span className="flex-1 truncate text-[13px]">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* profile + logout */}
        <div className={`border-t border-ds-border p-3 ${open ? "" : "flex justify-center"}`}>
          <div className="flex items-center gap-3 rounded-control p-2">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-ds-primary text-sm font-semibold text-white">
              {(profile?.nombre ?? "S").slice(0, 1).toUpperCase()}
            </div>
            {open && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ds-fg">{profile?.nombre ?? "Super Admin"}</p>
                <p className="truncate text-[11px] text-ds-fg-muted">MRZLABS SaaS</p>
              </div>
            )}
          </div>
          {open && (
            <SignOutButton className="mt-1 flex w-full items-center justify-center gap-2 rounded-control px-3 py-2 text-xs font-medium text-ds-danger transition-colors hover:bg-ds-danger-tint" />
          )}
        </div>
      </aside>

      {/* Main */}
      <div className={`min-h-dvh transition-[padding] duration-300 ${open ? "lg:pl-[17rem]" : "lg:pl-[5rem]"}`}>
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ds-border bg-ds-surface px-5 py-3">
          <div className="flex items-center gap-3">
            <button className="rounded-control border border-ds-border p-2 text-ds-fg-muted transition-colors hover:bg-ds-surface-2 hover:text-ds-fg lg:hidden" onClick={() => setMobileOpen(true)} type="button" aria-label="Abrir menú">
              <Menu className="size-4" />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ds-fg-muted">MRZLABS / SaaS</p>
              <h2 className="text-base font-semibold text-ds-fg">Panel de control</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-ds-success/30 bg-ds-success-tint px-2.5 py-0.5 text-[11px] font-medium text-ds-success sm:block">
              Sistema activo
            </span>
            <SignOutButton collapsed className="grid size-9 place-items-center rounded-control border border-ds-border text-ds-fg-muted transition-colors hover:bg-ds-surface-2 hover:text-ds-fg" />
          </div>
        </header>

        <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6">
          {demoMode && (
            <div className="mb-4 flex items-start gap-3 rounded-control border border-ds-warning/40 bg-ds-warning/10 px-4 py-3 text-ds-fg" role="status">
              <FlaskConical className="mt-0.5 size-4 shrink-0 text-ds-warning" />
              <div>
                <p className="text-[13px] font-semibold">Modo demostración</p>
                <p className="text-[12px] text-ds-fg-muted">Los datos son simulados y los cambios no se almacenan.</p>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
