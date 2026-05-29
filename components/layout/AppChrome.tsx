"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { UserRole } from "@/lib/auth/roles";

type NavItem = {
  href: string;
  label: string;
};

type HelpTopic = {
  title: string;
  body: string;
  cta?: string;
  href?: string;
};

const helpTopics: Record<UserRole, HelpTopic[]> = {
  admin: [
    {
      title: "Crear agenda",
      body: "Crea primero servicios, empleados y horarios en base de datos. Luego cliente o admin reserva una cita. La agenda se alimenta desde esas citas.",
      cta: "Ir a agenda",
      href: "/admin/agenda",
    },
    {
      title: "Cerrar turno",
      body: "Cuando una cita se realiza, entra a Turnos, registra precio final, propina y metodo de pago. Al cerrar, se descuenta inventario ligado al servicio.",
      cta: "Ir a turnos",
      href: "/admin/turnos",
    },
    {
      title: "Crear usuarios",
      body: "Desde Empleados creas usuario Auth, perfil interno, especialidad y comision. Desde Clientes puedes crear cliente manual o con acceso.",
      cta: "Ir a empleados",
      href: "/admin/empleados",
    },
  ],
  empleado: [
    {
      title: "Mi agenda",
      body: "Aqui ves solo tus citas. Usa WhatsApp manual para confirmar o contactar al cliente antes del servicio.",
      cta: "Ver agenda",
      href: "/empleado/mi-agenda",
    },
    {
      title: "Cerrar servicio",
      body: "Cierra un turno cuando hayas terminado. Registra precio final, propina, descuento y metodo de pago.",
      cta: "Cerrar turno",
      href: "/empleado/cerrar-turno",
    },
  ],
  cliente: [
    {
      title: "Reservar cita",
      body: "Selecciona servicio, especialista y fecha. El sistema consulta slots libres segun horarios, bloqueos y citas existentes.",
      cta: "Reservar",
      href: "/cliente/reservar",
    },
    {
      title: "Mis citas",
      body: "Puedes ver, cancelar o reprogramar tus citas antes de que queden realizadas.",
      cta: "Ver mis citas",
      href: "/cliente/mis-citas",
    },
  ],
};

const alerts: Record<UserRole, string[]> = {
  admin: ["2 citas próximas", "1 insumo bajo mínimo", "3 turnos pendientes de cierre"],
  empleado: ["Próxima cita en agenda", "Turno pendiente por cerrar"],
  cliente: ["Confirma tu cita", "Revisa tus reservas activas"],
};

function LogoMark() {
  return (
    <div className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 via-slate-950 to-cyan-500 text-white shadow-lg shadow-violet-950/25">
      <span className="absolute left-2 top-2 size-1.5 rounded-full bg-cyan-300" />
      <span className="text-sm font-black tracking-tight">B/L</span>
    </div>
  );
}

function BotIcon() {
  return (
    <span className="relative block h-12 w-10">
      <span className="absolute left-1/2 top-0 h-3 w-0.5 -translate-x-1/2 rounded-full bg-violet-300" />
      <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1 rounded-full bg-violet-400 shadow-[0_0_16px_rgba(167,139,250,.9)]" />
      <span className="absolute left-0 top-3 h-7 w-10 rounded-2xl border border-violet-200/60 bg-slate-950/80 shadow-[0_0_20px_rgba(124,58,237,.45)]">
        <span className="absolute left-2.5 top-3 size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,.9)]" />
        <span className="absolute right-2.5 top-3 size-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,.9)]" />
        <span className="absolute bottom-2 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-cyan-300/80" />
      </span>
      <span className="absolute bottom-0 left-1/2 h-4 w-7 -translate-x-1/2 rounded-b-2xl rounded-t-lg border border-violet-200/50 bg-violet-950/80" />
    </span>
  );
}

export function AppChrome({
  role,
  title,
  nav,
  mode,
  children,
}: {
  role: UserRole;
  title: string;
  nav: NavItem[];
  mode: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const [botOpen, setBotOpen] = useState(false);
  const [topicIndex, setTopicIndex] = useState(0);
  const topics = helpTopics[role];
  const topic = topics[topicIndex] ?? topics[0];
  const profileAlerts = useMemo(() => alerts[role], [role]);

  return (
    <div className="crm-neural min-h-dvh text-slate-950">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(124,58,237,.23),transparent_26rem),radial-gradient(circle_at_88%_12%,rgba(34,211,238,.18),transparent_24rem),linear-gradient(135deg,rgba(255,255,255,.92),rgba(245,243,255,.86))]" />
        <div className="neural-lines" />
      </div>

      <aside className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-white/70 bg-white/82 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-[calc(100%-4.25rem)]"}`}>
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <LogoMark />
            <div className={open ? "block" : "hidden"}>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-700">BarberLab</p>
              <h1 className="truncate text-sm font-black">{title}</h1>
            </div>
          </div>
          <button className="rounded-xl border bg-white px-3 py-2 text-sm font-black" onClick={() => setOpen((value) => !value)} type="button">
            {open ? "‹" : "›"}
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto p-3 ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${mode === "DEMO" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>{mode}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700">{role}</span>
          </div>
          <nav className="grid gap-1">
            {nav.map((item) => (
              <Link className="rounded-2xl px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-violet-50 hover:text-violet-700" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <section className="mt-5 rounded-3xl border bg-white/80 p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">Alarmas</p>
            <div className="mt-3 grid gap-2">
              {profileAlerts.map((item) => (
                <div className="rounded-2xl border border-violet-100 bg-violet-50/70 px-3 py-2 text-xs font-bold text-slate-700" key={item}>
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>

      <div className={`min-h-dvh transition-[padding] duration-300 ${open ? "lg:pl-72" : "lg:pl-[4.25rem]"}`}>
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/75 px-4 py-3 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <button className="rounded-2xl border bg-white px-3 py-2 text-sm font-black lg:hidden" onClick={() => setOpen((value) => !value)} type="button">
              Menú
            </button>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">MRZLABS / CRM</p>
              <h2 className="text-xl font-black tracking-tight">{title}</h2>
            </div>
            <button className="rounded-2xl border bg-white px-3 py-2 text-sm font-black text-violet-700" onClick={() => setBotOpen(true)} type="button">
              Ayuda
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      </div>

      <div className="fixed bottom-4 right-4 z-40 flex items-end gap-3">
        <div className="hidden rounded-full border border-violet-300/70 bg-slate-950/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-100 shadow-xl sm:block">
          Built by MRZLABS
        </div>
        <button className="grid size-16 place-items-center rounded-full border border-violet-300 bg-slate-950 shadow-2xl shadow-violet-950/40" onClick={() => setBotOpen((value) => !value)} type="button" aria-label="Abrir ayuda BarberLab">
          <BotIcon />
        </button>
      </div>

      {botOpen ? (
        <div className="fixed bottom-24 right-4 z-40 w-[min(92vw,390px)] rounded-3xl border bg-white/95 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Bot MRZLABS</p>
              <h3 className="mt-1 text-xl font-black">{topic.title}</h3>
            </div>
            <button className="rounded-xl border px-3 py-1 text-sm font-black" onClick={() => setBotOpen(false)} type="button">Cerrar</button>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{topic.body}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {topics.map((item, index) => (
              <button className={`rounded-xl px-3 py-2 text-xs font-black ${index === topicIndex ? "bg-violet-600 text-white" : "border bg-white text-slate-700"}`} key={item.title} onClick={() => setTopicIndex(index)} type="button">
                {item.title}
              </button>
            ))}
          </div>
          {topic.href && topic.cta ? (
            <Link className="mt-4 block rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white" href={topic.href}>
              {topic.cta}
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
