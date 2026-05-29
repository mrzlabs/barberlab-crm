"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  Boxes,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  CreditCard,
  LayoutDashboard,
  Menu,
  Scissors,
  Search,
  Settings2,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { UserRole } from "@/lib/auth/roles";

type NavItem = {
  href: string;
  label: string;
};

type NavStyle = {
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
};

type HelpTopic = {
  title: string;
  body: string;
  steps: string[];
  cta?: string;
  href?: string;
};

const navStyles: Record<string, NavStyle> = {
  Dashboard: { icon: LayoutDashboard, tone: "from-blue-500 to-cyan-400 text-white" },
  Agenda: { icon: CalendarDays, tone: "from-emerald-500 to-teal-400 text-white" },
  Turnos: { icon: ClipboardCheck, tone: "from-orange-500 to-amber-300 text-white" },
  Gastos: { icon: CreditCard, tone: "from-rose-500 to-pink-400 text-white" },
  Inventario: { icon: Boxes, tone: "from-lime-500 to-emerald-400 text-slate-950" },
  Servicios: { icon: Scissors, tone: "from-violet-600 to-fuchsia-400 text-white" },
  Empleados: { icon: Users, tone: "from-sky-500 to-blue-500 text-white" },
  Clientes: { icon: Users, tone: "from-teal-500 to-cyan-400 text-white" },
  Reportes: { icon: Settings2, tone: "from-slate-800 to-violet-600 text-white" },
  "Mi agenda": { icon: CalendarDays, tone: "from-emerald-500 to-teal-400 text-white" },
  "Cerrar turno": { icon: ClipboardCheck, tone: "from-orange-500 to-amber-300 text-white" },
  Reservar: { icon: CalendarDays, tone: "from-cyan-500 to-blue-500 text-white" },
  "Mis citas": { icon: ClipboardCheck, tone: "from-violet-600 to-fuchsia-400 text-white" },
};

const helpTopics: Record<UserRole, HelpTopic[]> = {
  admin: [
    {
      title: "Crear operacion",
      body: "Admin controla el CRM completo: servicios, empleados, clientes, agenda, turnos, caja, inventario y reportes.",
      steps: [
        "Crea servicios con duracion, precio y costo de insumo.",
        "Crea empleados con especialidad, comision y estado activo.",
        "Carga horarios y bloqueos para liberar disponibilidad real.",
        "Agenda desde admin o deja que cliente reserve y empleado confirme.",
      ],
      cta: "Ir a agenda",
      href: "/admin/agenda",
    },
    {
      title: "Cerrar turno",
      body: "El turno nace desde una cita realizada. Al cerrarlo quedan ingreso, propina, pago, descuento e insumos consumidos.",
      steps: [
        "Entra a Turnos.",
        "Selecciona cita pendiente.",
        "Registra precio final, propina y metodo de pago.",
        "El sistema deja base para margen, comision e inventario.",
      ],
      cta: "Cerrar turno",
      href: "/admin/turnos",
    },
    {
      title: "Alertas",
      body: "Las alertas deben orientar la operacion diaria: citas pendientes, stock minimo, turnos sin cierre y agenda sin disponibilidad.",
      steps: [
        "Revisa alarma superior y panel lateral.",
        "Prioriza citas proximas.",
        "Reabastece productos bajo minimo.",
        "Cierra turnos antes de terminar el dia.",
      ],
      cta: "Ver inventario",
      href: "/admin/inventario",
    },
  ],
  empleado: [
    {
      title: "Mi agenda",
      body: "Empleado ve su carga asignada, citas pendientes por aceptar, citas del dia y servicios cerrados.",
      steps: [
        "Consulta la agenda diaria.",
        "Contacta al cliente por WhatsApp si requiere confirmar.",
        "Marca la atencion cuando termine el servicio.",
        "Cierra el turno con metodo de pago y observaciones.",
      ],
      cta: "Ver agenda",
      href: "/empleado/mi-agenda",
    },
    {
      title: "Cerrar servicio",
      body: "El cierre alimenta caja, comisiones y reportes del admin.",
      steps: ["Selecciona cita realizada.", "Registra precio final.", "Agrega propina o descuento.", "Guarda el turno."],
      cta: "Cerrar turno",
      href: "/empleado/cerrar-turno",
    },
  ],
  cliente: [
    {
      title: "Reservar cita",
      body: "Cliente consulta agenda disponible, separa cita y espera confirmacion operativa del comercio.",
      steps: [
        "Selecciona servicio.",
        "Elige especialista.",
        "Consulta horarios disponibles.",
        "Reserva y revisa estado en Mis citas.",
      ],
      cta: "Reservar",
      href: "/cliente/reservar",
    },
    {
      title: "Productos",
      body: "La vista cliente puede mostrar productos disponibles para compra manual en sede o por WhatsApp.",
      steps: [
        "Consulta productos recomendados.",
        "Solicita compra en el comercio.",
        "Agenda servicio relacionado.",
        "Conserva historial de citas.",
      ],
      cta: "Mis citas",
      href: "/cliente/mis-citas",
    },
  ],
};

const alerts: Record<UserRole, { label: string; tone: string; href: string; detail: string }[]> = {
  admin: [
    { label: "2 citas proximas", tone: "bg-cyan-50 text-cyan-700", href: "/admin/agenda", detail: "Revisar agenda y aprobaciones" },
    { label: "1 insumo bajo minimo", tone: "bg-amber-50 text-amber-700", href: "/admin/inventario", detail: "Revisar stock y reposicion" },
    { label: "3 turnos pendientes", tone: "bg-violet-50 text-violet-700", href: "/admin/turnos", detail: "Cerrar caja e insumos" },
  ],
  empleado: [
    { label: "Cita por aceptar", tone: "bg-violet-50 text-violet-700", href: "/empleado/mi-agenda", detail: "Validar cliente y horario" },
    { label: "Turno por cerrar", tone: "bg-cyan-50 text-cyan-700", href: "/empleado/cerrar-turno", detail: "Registrar pago final" },
  ],
  cliente: [
    { label: "Reserva pendiente", tone: "bg-cyan-50 text-cyan-700", href: "/cliente/mis-citas", detail: "Revisar estado de cita" },
    { label: "Productos disponibles", tone: "bg-emerald-50 text-emerald-700", href: "/cliente/reservar", detail: "Ver recomendados" },
  ],
};

function LogoMark() {
  return (
    <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/50 bg-slate-950 text-white shadow-xl shadow-violet-950/25">
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,.9),transparent_1.2rem),radial-gradient(circle_at_78%_82%,rgba(168,85,247,.85),transparent_1.4rem)]" />
      <span className="relative text-[11px] font-black tracking-[0.24em]">BL</span>
      <span className="absolute bottom-2 left-1/2 h-px w-6 -translate-x-1/2 bg-cyan-200" />
    </div>
  );
}

function BotIcon() {
  return (
    <span className="bot-drift relative block h-12 w-10">
      <span className="absolute left-1/2 top-0 h-3 w-0.5 -translate-x-1/2 rounded-full bg-violet-300" />
      <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1 rounded-full bg-violet-400 shadow-[0_0_16px_rgba(167,139,250,.9)]" />
      <span className="absolute left-0 top-3 h-7 w-10 rounded-2xl border border-violet-200/70 bg-slate-950/90 shadow-[0_0_20px_rgba(124,58,237,.5)]">
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [botOpen, setBotOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alertsHidden, setAlertsHidden] = useState(false);
  const [topicIndex, setTopicIndex] = useState(0);
  const topics = helpTopics[role];
  const topic = topics[topicIndex] ?? topics[0];
  const profileAlerts = useMemo(() => alerts[role], [role]);

  return (
    <div className="crm-neural min-h-dvh overflow-x-hidden text-slate-950">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(124,58,237,.20),transparent_26rem),radial-gradient(circle_at_82%_8%,rgba(34,211,238,.18),transparent_24rem),radial-gradient(circle_at_58%_72%,rgba(20,184,166,.13),transparent_24rem),linear-gradient(135deg,rgba(255,255,255,.96),rgba(247,245,255,.9)_45%,rgba(238,253,255,.86))]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(135deg,#111827_25%,transparent_25%),linear-gradient(225deg,#111827_25%,transparent_25%),linear-gradient(45deg,#111827_25%,transparent_25%),linear-gradient(315deg,#111827_25%,rgba(255,255,255,0)_25%)] [background-position:18px_0,18px_0,0_0,0_0] [background-size:36px_36px] [background-repeat:repeat]" />
        <div className="neural-lines" />
      </div>

      {mobileOpen ? <button className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden" onClick={() => setMobileOpen(false)} type="button" aria-label="Cerrar menu" /> : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[19rem] flex-col border-r border-white/70 bg-white/86 shadow-2xl shadow-slate-950/12 backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${open ? "lg:w-[19rem]" : "lg:w-[5.2rem]"}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <LogoMark />
            <div className={open ? "block" : "hidden"}>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-violet-700">BarberLab</p>
              <h1 className="truncate text-sm font-black">{title}</h1>
            </div>
          </div>
          <button className="hidden rounded-xl border bg-white p-2 text-slate-700 lg:grid" onClick={() => setOpen((value) => !value)} type="button" aria-label="Contraer menu">
            {open ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
          <button className="rounded-xl border bg-white p-2 text-slate-700 lg:hidden" onClick={() => setMobileOpen(false)} type="button" aria-label="Cerrar menu">
            <X className="size-4" />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto p-3 ${open ? "opacity-100" : "opacity-100"}`}>
          <div className={`mb-4 flex flex-wrap gap-2 ${open ? "justify-start" : "justify-center"}`}>
            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${mode === "DEMO" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>
              {open ? mode : mode.slice(0, 1)}
            </span>
            {open ? <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-700">{role}</span> : null}
          </div>

          <label className={`mb-3 flex items-center gap-2 rounded-2xl border bg-white px-3 py-2 text-xs font-bold text-slate-500 ${open ? "block" : "hidden"}`}>
            <Search className="size-4" />
            <input className="w-full bg-transparent outline-none" placeholder="Buscar modulo" />
          </label>

          <nav className="grid gap-1">
            {nav.map((item) => {
              const style = navStyles[item.label] ?? navStyles.Dashboard;
              const Icon = style.icon;
              return (
                <Link
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-black text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 ${open ? "justify-start" : "justify-center"}`}
                  href={item.href}
                  key={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className={`grid size-9 place-items-center rounded-xl bg-gradient-to-br shadow-sm transition group-hover:scale-105 ${style.tone}`}>
                    <Icon className="size-4" />
                  </span>
                  {open ? item.label : null}
                </Link>
              );
            })}
          </nav>

          <section className={`mt-5 rounded-3xl border bg-white/82 p-4 shadow-sm ${open && !alertsHidden ? "block" : "hidden"}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">Alarmas</p>
              <button className="rounded-lg p-1 text-violet-600 hover:bg-violet-50" onClick={() => setAlertsHidden(true)} type="button" aria-label="Ocultar alarmas">
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              {profileAlerts.map((item) => (
                <Link className={`rounded-2xl px-3 py-2 text-xs font-black ${item.tone}`} href={item.href} key={item.label}>
                  {item.label}
                </Link>
              ))}
            </div>
          </section>
          {open && alertsHidden ? (
            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border bg-white px-3 py-3 text-xs font-black text-violet-700" onClick={() => setAlertsHidden(false)} type="button">
              <Bell className="size-4" />
              Mostrar alarmas
            </button>
          ) : null}
        </div>
      </aside>

      <div className={`min-h-dvh transition-[padding] duration-300 ${open ? "lg:pl-[19rem]" : "lg:pl-[5.2rem]"}`}>
        <header className="sticky top-0 z-20 border-b border-white/70 bg-white/76 px-4 py-3 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="rounded-2xl border bg-white p-3 text-slate-800 lg:hidden" onClick={() => setMobileOpen(true)} type="button" aria-label="Abrir menu">
                <Menu className="size-4" />
              </button>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-700">MRZLABS / CRM</p>
                <h2 className="text-lg font-black tracking-tight sm:text-2xl">{title}</h2>
              </div>
            </div>
            <div className="relative hidden items-center gap-2 md:flex">
              <button className="relative grid size-11 place-items-center rounded-2xl border bg-white text-violet-700 shadow-sm" onClick={() => setAlertsOpen((value) => !value)} type="button" aria-label="Ver alarmas">
                <Bell className="size-5" />
                {!alertsHidden ? <span className="absolute right-2 top-2 size-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,.9)]" /> : null}
              </button>
              <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white" onClick={() => setBotOpen(true)} type="button">
                Ayuda
              </button>
              {alertsOpen ? (
                <div className="absolute right-20 top-14 z-50 w-80 rounded-[1.6rem] border bg-white/96 p-4 shadow-2xl shadow-slate-950/18 backdrop-blur-2xl">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Alarmas</p>
                    <button className="text-xs font-black text-slate-500" onClick={() => setAlertsHidden((value) => !value)} type="button">
                      {alertsHidden ? "Mostrar" : "Ocultar"}
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {(alertsHidden ? [] : profileAlerts).map((item) => (
                      <Link className={`block rounded-2xl px-3 py-3 text-xs font-black ${item.tone}`} href={item.href} key={item.label} onClick={() => setAlertsOpen(false)}>
                        <span className="block">{item.label}</span>
                        <span className="mt-1 block font-semibold opacity-75">{item.detail}</span>
                      </Link>
                    ))}
                    {alertsHidden ? <p className="rounded-2xl border border-dashed p-4 text-center text-xs font-bold text-slate-500">Alarmas ocultas.</p> : null}
                  </div>
                </div>
              ) : null}
            </div>
            <button className="grid size-11 place-items-center rounded-2xl bg-slate-950 text-white md:hidden" onClick={() => setBotOpen(true)} type="button" aria-label="Abrir ayuda">
              <CircleHelp className="size-5" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6">{children}</main>
      </div>

      {aboutOpen ? (
        <div className="fixed bottom-24 right-4 z-40 w-[min(92vw,360px)] rounded-3xl border border-violet-200 bg-white/96 p-5 shadow-2xl shadow-violet-950/18 backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-700">MRZLABS</p>
              <h3 className="mt-1 text-lg font-black">CRM adaptable para negocios reales</h3>
            </div>
            <button className="rounded-xl border p-2" onClick={() => setAboutOpen(false)} type="button" aria-label="Cerrar MRZLABS">
              <X className="size-4" />
            </button>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Disenamos sistemas con agenda, caja, inventario, reportes y roles para que el comercio pueda operar, medir y vender mejor sin depender de procesos manuales.
          </p>
        </div>
      ) : null}

      <div className="signature-neural fixed bottom-0 left-0 right-0 z-30 h-20 border-t border-violet-300/20 bg-slate-950/92" />

      <div className="bot-roam fixed z-40 flex items-end gap-3">
        <button className="hidden rounded-full border border-violet-300/70 bg-violet-950/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-violet-100 shadow-xl sm:block" onClick={() => setAboutOpen((value) => !value)} type="button">
          Built by MRZLABS
        </button>
        <button className="grid size-16 place-items-center rounded-full border border-violet-300 bg-slate-950 shadow-2xl shadow-violet-950/40" onClick={() => setBotOpen((value) => !value)} type="button" aria-label="Abrir ayuda BarberLab">
          <BotIcon />
        </button>
      </div>

      {botOpen ? (
        <div className="fixed bottom-24 right-4 z-40 max-h-[75dvh] w-[min(94vw,470px)] overflow-y-auto rounded-[2rem] border border-violet-200 bg-white/96 p-5 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-700">Bot MRZLABS</p>
              <h3 className="mt-1 text-2xl font-black">Guia completa BarberLab</h3>
            </div>
            <button className="rounded-xl border p-2" onClick={() => setBotOpen(false)} type="button" aria-label="Cerrar ayuda">
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-4 rounded-3xl bg-slate-950 p-4 text-white">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-cyan-300" />
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Flujo activo</p>
            </div>
            <h4 className="mt-3 text-xl font-black">{topic.title}</h4>
            <p className="mt-2 text-sm leading-6 text-slate-300">{topic.body}</p>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {topics.map((item, index) => (
              <button className={`shrink-0 rounded-2xl px-4 py-3 text-xs font-black ${index === topicIndex ? "bg-violet-700 text-white" : "border bg-white text-slate-700"}`} key={item.title} onClick={() => setTopicIndex(index)} type="button">
                {item.title}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-2">
            {topic.steps.map((step, index) => (
              <div className="flex gap-3 rounded-2xl border bg-slate-50 p-3 text-sm text-slate-700" key={step}>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-cyan-100 text-xs font-black text-cyan-700">{index + 1}</span>
                <span>{step}</span>
              </div>
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
