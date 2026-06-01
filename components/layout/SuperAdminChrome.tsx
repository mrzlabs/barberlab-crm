"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatedGrid } from "@/components/layout/AnimatedGrid";
import { SignOutButton } from "@/components/layout/SignOutButton";
import {
  Activity,
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
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
  profile,
}: {
  children: React.ReactNode;
  profile?: CurrentProfile;
}) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-dvh overflow-x-hidden" style={{ background: "#0a0a0f", color: "#f1f5f9" }}>

      {/* ── Fixed background ─────────────────────────────────────── */}
      <div className="fixed inset-0 -z-10" style={{ background: "#0a0a0f" }}>
        <AnimatedGrid className="absolute inset-0" dark lineOpacity={0.07} accentOpacity={0.18} />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          className="fixed inset-0 z-30 lg:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setMobileOpen(false)}
          type="button"
          aria-label="Cerrar menú"
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r transition-all duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${open ? "w-[min(17rem,88vw)] lg:w-[17rem]" : "w-[17rem] lg:w-[5rem]"}`}
        style={{ background: "#111118", borderColor: "rgba(255,255,255,0.07)" }}
      >
        {/* logo / header */}
        <div
          className="flex items-center justify-between gap-3 border-b p-4"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="grid size-10 shrink-0 place-items-center rounded-2xl text-sm font-black"
              style={{ background: "linear-gradient(135deg,#22d3ee,#7c3aed)", color: "#fff" }}
            >
              MZ
            </div>
            {open && (
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: "#22d3ee" }}>
                  MRZLABS
                </p>
                <p className="truncate text-sm font-black text-white">SaaS Admin</p>
              </div>
            )}
          </div>
          <button
            className="hidden rounded-xl border p-1.5 text-white/50 transition hover:text-white lg:grid"
            style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}
            onClick={() => setOpen((v) => !v)}
            type="button"
            aria-label="Contraer menú"
          >
            {open ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
          <button
            className="rounded-xl border p-1.5 text-white/50 lg:hidden"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
            onClick={() => setMobileOpen(false)}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* nav */}
        <div className="flex-1 overflow-y-auto p-3">
          {/* badge */}
          <div className={`mb-4 ${open ? "flex" : "flex justify-center"}`}>
            <span
              className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide"
              style={{ background: "rgba(124,58,237,0.18)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.28)" }}
            >
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
                  onClick={() => setMobileOpen(false)}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    open ? "justify-start" : "justify-center"
                  }`}
                  style={
                    isActive
                      ? { background: "linear-gradient(135deg,rgba(34,211,238,0.18),rgba(124,58,237,0.18))", color: "#e2e8f0", boxShadow: "inset 0 0 0 1px rgba(34,211,238,0.22)" }
                      : { color: "rgba(255,255,255,0.55)" }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = "";
                  }}
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-[14px] text-white transition-all group-hover:scale-105 ${isActive ? "scale-105" : ""}`}
                    style={isActive ? { background: "linear-gradient(135deg,#22d3ee,#7c3aed)", boxShadow: "0 4px 16px rgba(34,211,238,0.28)" } : { background: "rgba(255,255,255,0.07)" }}
                  >
                    <Icon className="size-[17px]" />
                  </span>
                  {open && (
                    <span className="flex-1 truncate text-[13.5px]">{item.label}</span>
                  )}
                  {open && isActive && (
                    <span className="size-1.5 shrink-0 rounded-full" style={{ background: "#22d3ee" }} />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* profile + logout */}
        <div
          className={`border-t p-3 ${open ? "" : "flex justify-center"}`}
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-white/5">
            <div
              className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-black text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#111827)" }}
            >
              {(profile?.nombre ?? "S").slice(0, 1).toUpperCase()}
            </div>
            {open && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-white">{profile?.nombre ?? "Super Admin"}</p>
                  <p className="truncate text-[11px] font-medium text-white/40">MRZLABS SaaS</p>
                </div>
              </>
            )}
          </div>
          {open && (
            <SignOutButton
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-400 transition hover:bg-rose-950/40 hover:text-rose-300"
            />
          )}
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <div className={`min-h-dvh transition-[padding] duration-300 ${open ? "lg:pl-[17rem]" : "lg:pl-[5rem]"}`}>
        {/* topbar */}
        <header
          className="sticky top-0 z-20 flex items-center justify-between border-b px-5 py-3.5 backdrop-blur-2xl"
          style={{ background: "rgba(10,10,15,0.85)", borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl border p-2.5 text-white/60 transition hover:text-white lg:hidden"
              style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)" }}
              onClick={() => setMobileOpen(true)}
              type="button"
              aria-label="Abrir menú"
            >
              <Menu className="size-4" />
            </button>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: "#22d3ee" }}>
                MRZLABS / SaaS
              </p>
              <h2 className="text-lg font-black tracking-tight text-white">Panel de control</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="hidden rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide sm:block"
              style={{ background: "rgba(34,211,238,0.12)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.2)" }}
            >
              <BarChart3 className="mr-1 inline size-3" />
              Sistema activo
            </span>
            <SignOutButton
              collapsed
              className="grid size-9 place-items-center rounded-xl border text-white/50 transition hover:text-white"
            />
          </div>
        </header>

        <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
