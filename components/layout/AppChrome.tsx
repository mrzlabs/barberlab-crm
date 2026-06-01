"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeApplier } from "@/components/layout/ThemeApplier";
import { AnimatedGrid } from "@/components/layout/AnimatedGrid";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { BackButton } from "@/components/layout/BackButton";
import { PageTransition } from "@/components/layout/PageTransition";
import { CursorGlow } from "@/components/layout/CursorGlow";
import { FontLoader } from "@/components/layout/FontLoader";
import { MrzHelpBot } from "@/components/layout/MrzHelpBot";
import { MrzSignature } from "@/components/layout/MrzSignature";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { navStyles } from "@/components/layout/nav-config";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  X,
  UserCircle,
} from "lucide-react";
import type { UserRole } from "@/lib/auth/roles";
import type { CurrentProfile } from "@/lib/auth/session";
import type { ConfigVisual } from "@/lib/db/schema";

// ─── Types ───────────────────────────────────────────────────────────────────

type NavItem = { href: string; label: string };
type HelpTopic = {
  title: string;
  body: string;
  steps: string[];
  tips?: string[];
  cta?: string;
  href?: string;
};

// ─── Help topics ─────────────────────────────────────────────────────────────

const helpTopics: Record<UserRole, HelpTopic[]> = {
  super_admin: [
    {
      title: "Negocios SaaS",
      body: "Este panel controla las barberias registradas, planes, estado de suscripcion, colores, logo y modo de aislamiento.",
      steps: [
        "Registra una barberia desde el panel MRZLABS.",
        "Define plan Starter, Pro o Enterprise.",
        "Personaliza colores, fuente y logo.",
        "Crea el admin inicial del negocio.",
      ],
      tips: ["Usa dedicado solo para clientes enterprise.", "Suspende negocios con pagos vencidos."],
      cta: "Ver negocios",
      href: "/super-admin/negocios",
    },
  ],
  admin: [
    {
      title: "Dashboard",
      body: "El dashboard es el centro de control de BarberLab. Muestra en tiempo real el rendimiento del negocio: citas del día, caja acumulada, turnos pendientes, insumos críticos y actividad por empleado.",
      steps: [
        "Revisa las métricas clave al iniciar el día: citas programadas, ingresos y alertas.",
        "Usa los cards de acceso rápido para navegar a agenda, turnos o inventario.",
        "Identifica si hay empleados sin citas asignadas o turnos sin cerrar.",
        "Los gráficos de ingresos te permiten comparar semanas y detectar tendencias.",
        "Prioriza los módulos que tengan alertas activas (indicados en rojo o naranja).",
      ],
      tips: [
        "Cierra todos los turnos antes del final del día para que los reportes sean exactos.",
        "Configura horarios de empleados para que la disponibilidad real aparezca en la agenda.",
      ],
      cta: "Ir al dashboard",
      href: "/admin/dashboard",
    },
    {
      title: "Agenda",
      body: "La agenda es el núcleo operativo del negocio. Muestra todas las citas por día, empleado y estado. Permite crear, confirmar, reprogramar y cancelar citas desde un solo lugar.",
      steps: [
        "Entra a Agenda para ver todas las citas del día agrupadas por hora y empleado.",
        "Crea una cita nueva con el botón '+': elige cliente, servicio, especialista y horario.",
        "El sistema valida automáticamente la disponibilidad del empleado antes de confirmar.",
        "Cambia el estado de una cita: reservada → confirmada → realizada o cancelada.",
        "Usa el filtro por empleado o fecha para ver cargas individuales.",
        "Las citas realizadas se convierten en turnos disponibles para cierre de caja.",
      ],
      tips: [
        "Carga los horarios de cada empleado antes de abrir la agenda al público.",
        "Las citas reservadas por clientes desde /cliente/reservar aparecen aquí con estado 'pendiente'.",
      ],
      cta: "Ir a la agenda",
      href: "/admin/agenda",
    },
    {
      title: "Turnos y caja",
      body: "El módulo de turnos convierte cada cita realizada en un registro contable. Aquí se cierra la operación: precio final, propina, método de pago, descuento e insumos consumidos.",
      steps: [
        "Entra a Turnos: verás todas las citas con estado 'realizada' listas para cerrar.",
        "Selecciona una cita y registra el precio final (puede diferir del precio base del servicio).",
        "Agrega propina si la hubo y selecciona método de pago: efectivo, transferencia o tarjeta.",
        "Aplica descuento porcentual o fijo si corresponde.",
        "Escribe observaciones operativas si aplica (cliente frecuente, servicio extendido, etc.).",
        "Al guardar, el sistema genera el registro contable y descuenta insumos del inventario.",
      ],
      tips: [
        "Cierra todos los turnos del día antes de revisar reportes para que los totales sean correctos.",
        "El margen real = precio final − costo insumos − comisión empleado.",
      ],
      cta: "Ver turnos",
      href: "/admin/turnos",
    },
    {
      title: "Gastos",
      body: "El módulo de gastos registra todos los egresos del negocio: arriendos, servicios, compras de insumos, comisiones externas y gastos operativos.",
      steps: [
        "Registra cada gasto con categoría, monto, fecha y método de pago.",
        "Asigna gastos a categorías como Insumos, Arriendo, Marketing, Personal u Otros.",
        "El total de gastos aparece en el reporte de rentabilidad junto a los ingresos por turnos.",
        "Adjunta referencia o número de factura para trazabilidad contable.",
      ],
      tips: [
        "Registra los gastos en la misma semana que ocurren para mantener el flujo de caja real.",
        "Separar gastos de insumos de gastos fijos te permite calcular el margen por servicio.",
      ],
      cta: "Ver gastos",
      href: "/admin/gastos",
    },
    {
      title: "Inventario",
      body: "El inventario controla el stock de productos e insumos del negocio. Alerta cuando un producto baja del mínimo, registra entradas y permite ver el costo asociado a cada servicio.",
      steps: [
        "Crea productos con nombre, unidad, stock actual, stock mínimo y costo unitario.",
        "Cada vez que se cierra un turno, el sistema descuenta los insumos asociados al servicio.",
        "Las alertas de stock bajo aparecen en el dashboard y en la campana de notificaciones.",
        "Registra entradas de inventario (compras) para actualizar stock y costo promedio.",
      ],
      tips: [
        "Define el stock mínimo como la cantidad que necesitas para una semana de operación.",
        "Asocia insumos a servicios para que el costo de materiales sea automático al cerrar turno.",
      ],
      cta: "Ver inventario",
      href: "/admin/inventario",
    },
    {
      title: "Servicios",
      body: "El catálogo de servicios define qué ofrece el negocio: corte, barba, coloración, tratamientos, combos.",
      steps: [
        "Crea un servicio con nombre, descripción, precio de venta y duración estimada.",
        "Asigna el costo de insumos para calcular margen real por servicio.",
        "Vincula el servicio a los empleados que pueden realizarlo (por especialidad).",
        "Los servicios activos aparecen en la vista de reserva del cliente.",
      ],
      tips: [
        "Agrupa servicios en combos para aumentar el ticket promedio.",
        "El precio sugerido debe cubrir costo insumo + comisión + margen del negocio.",
      ],
      cta: "Ver servicios",
      href: "/admin/servicios",
    },
    {
      title: "Empleados",
      body: "Gestiona el equipo: crea perfiles con especialidad, estado, comisión y credenciales de acceso.",
      steps: [
        "Crea el perfil del empleado con nombre, especialidad y porcentaje de comisión.",
        "Asigna las credenciales de acceso para que el empleado entre al CRM como rol 'empleado'.",
        "Carga los horarios semanales del empleado (días y horas disponibles).",
        "Registra bloqueos para vacaciones, festivos o citas personales.",
      ],
      tips: [
        "Los horarios y bloqueos son la fuente de verdad para la disponibilidad en la agenda.",
        "Ajusta la comisión por empleado individualmente para reflejar acuerdos comerciales reales.",
      ],
      cta: "Ver empleados",
      href: "/admin/empleados",
    },
    {
      title: "Clientes",
      body: "El CRM de clientes guarda el historial completo de cada persona: citas, servicios consumidos, gasto total, fecha de última visita y notas del negocio.",
      steps: [
        "Crea el perfil del cliente con nombre, teléfono y correo.",
        "El sistema registra automáticamente cada cita y turno cerrado en su historial.",
        "Consulta el historial para conocer preferencias, servicios frecuentes y antigüedad.",
        "Agrega notas internas (alergias, preferencias de corte, condiciones especiales).",
      ],
      tips: [
        "El ticket promedio por cliente se calcula automáticamente desde los turnos cerrados.",
        "Contacta a clientes con más de 30 días sin visita como estrategia de retención.",
      ],
      cta: "Ver clientes",
      href: "/admin/clientes",
    },
    {
      title: "Reportes",
      body: "Los reportes convierten la operación diaria en inteligencia de negocio: ingresos netos, margen por servicio, rendimiento por empleado, productos más consumidos y flujo de caja mensual.",
      steps: [
        "Accede al reporte de ingresos para ver el total diario, semanal y mensual.",
        "El reporte de empleados muestra citas realizadas, ingresos generados y comisiones.",
        "El análisis de servicios identifica cuáles son más rentables y cuáles tienen bajo margen.",
        "El flujo de caja cruza ingresos por turnos con gastos registrados para el resultado neto.",
        "Exporta los datos a CSV para análisis externo o contabilidad.",
      ],
      tips: [
        "Cierra todos los turnos y registra todos los gastos antes de leer el reporte mensual.",
        "Compara el margen real con el estimado para ajustar precios o costos de insumo.",
      ],
      cta: "Ver reportes",
      href: "/admin/reportes",
    },
  ],
  empleado: [
    {
      title: "Mi agenda",
      body: "Como empleado, tu agenda muestra todas tus citas del día organizadas por hora.",
      steps: [
        "Revisa tu agenda al inicio del turno para conocer la carga del día.",
        "Las citas en estado 'pendiente' necesitan tu confirmación antes de atender.",
        "Marca la cita como 'realizada' al terminar el servicio.",
        "Las citas realizadas quedan disponibles para cierre de turno.",
      ],
      tips: [
        "Si un cliente no llega, márcala como 'no asistió' para mantener el registro limpio.",
      ],
      cta: "Ver mi agenda",
      href: "/empleado/mi-agenda",
    },
    {
      title: "Cerrar turno",
      body: "El cierre de turno es el paso final de cada atención. Registras el cobro: precio final, propina, método de pago y descuento.",
      steps: [
        "Entra a 'Cerrar turno' después de realizar el servicio.",
        "Selecciona la cita que acabas de completar.",
        "Confirma el precio final y registra el método de pago.",
        "Guarda el turno: el registro queda en caja.",
      ],
      tips: [
        "Cierra cada turno en el momento para evitar errores al final del día.",
      ],
      cta: "Cerrar turno",
      href: "/empleado/cerrar-turno",
    },
  ],
  cliente: [
    {
      title: "Reservar cita",
      body: "Reserva tu próxima cita en segundos: elige el servicio, el especialista y el horario disponible.",
      steps: [
        "Elige el servicio que necesitas.",
        "Selecciona el especialista de tu preferencia.",
        "Confirma el horario disponible.",
        "Tu cita queda en estado 'reservada'.",
      ],
      tips: ["Reserva con al menos 24 horas de anticipación."],
      cta: "Reservar ahora",
      href: "/cliente/reservar",
    },
    {
      title: "Mis citas",
      body: "Consulta el historial completo de tus reservas: pasadas, próximas y pendientes de confirmación.",
      steps: [
        "Consulta el estado de tu reserva más reciente.",
        "Las citas 'confirmadas' están agendadas y listas.",
        "Puedes cancelar con al menos 2 horas de anticipación.",
      ],
      tips: ["Contacta directamente al negocio si tienes dudas sobre una cita."],
      cta: "Ver mis citas",
      href: "/cliente/mis-citas",
    },
    {
      title: "Productos",
      body: "Descubre los productos de cuidado capilar disponibles para compra en sede.",
      steps: [
        "Revisa el catálogo de productos disponibles.",
        "Para comprar, solicítalo directamente en el local.",
      ],
      tips: ["Pregunta a tu especialista qué productos se usaron en tu servicio."],
      cta: "Reservar y comprar",
      href: "/cliente/reservar",
    },
  ],
};

// ─── Alert type ──────────────────────────────────────────────────────────────

type AppAlert = { label: string; tone: string; href: string; detail: string };

// ─── LogoMark ─────────────────────────────────────────────────────────────────

function LogoMark({ brand }: { brand?: CurrentProfile }) {
  if (brand?.logoUrl) {
    return (
      <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/50 bg-white shadow-xl shadow-violet-950/15">
        <img alt={brand.negocioNombre || "Logo"} className="h-full w-full object-cover" src={brand.logoUrl} />
      </div>
    );
  }
  return (
    <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/50 text-white shadow-xl shadow-violet-950/25" style={{ backgroundColor: brand?.colorPrimario || "#0f172a" }}>
      <span className="absolute inset-0 opacity-80" style={{ background: `radial-gradient(circle at 20% 10%, ${brand?.colorSecundario || "#22d3ee"}, transparent 1.2rem), radial-gradient(circle at 78% 82%, ${brand?.colorAcento || "#7c3aed"}, transparent 1.4rem)` }} />
      <span className="relative text-[11px] font-black tracking-[0.24em]">{(brand?.negocioNombre || "BL").slice(0, 2).toUpperCase()}</span>
      <span className="absolute bottom-2 left-1/2 h-px w-6 -translate-x-1/2" style={{ backgroundColor: brand?.colorSecundario || "#67e8f9" }} />
    </div>
  );
}

// ─── AppChrome ───────────────────────────────────────────────────────────────

function hexAlpha(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(17,24,39,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function AppChrome({
  role, title, nav, mode, children, brand, alerts = [], configVisual,
}: {
  role: UserRole;
  title: string;
  nav: NavItem[];
  mode: string;
  children: React.ReactNode;
  brand?: CurrentProfile;
  alerts?: AppAlert[];
  configVisual?: ConfigVisual | null;
}) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alertsHidden, setAlertsHidden] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const pathname = usePathname();
  const topics = helpTopics[role];

  const primaryColor  = brand?.colorPrimario  || "#111827";
  const secondaryColor = brand?.colorSecundario || "#22d3ee";
  const accentColor   = brand?.colorAcento    || "#7c3aed";
  const bgPhotoUrl    = configVisual?.bgPhotoUrl;
  const fontFamily = configVisual?.fontFamily || brand?.fuente || "Inter";
  const roleLabel = role === "super_admin" ? "Super Admin" : role === "admin" ? "Admin" : role === "empleado" ? "Empleado" : "Cliente";
  const headerIdentity = `${brand?.nombre ?? "Usuario"} / ${roleLabel}`;

  return (
    <div
      className="crm-shell min-h-dvh overflow-x-hidden text-white"
      style={{
        ["--brand-primary" as string]: primaryColor,
        ["--brand-secondary" as string]: secondaryColor,
        ["--brand-accent" as string]: accentColor,
        fontFamily: `${fontFamily}, Inter, Segoe UI, Roboto, Arial, sans-serif`,
      }}
    >
      <ThemeApplier
        primary={primaryColor}
        secondary={secondaryColor}
        accent={accentColor}
        fuente={fontFamily}
      />
      <FontLoader fontFamily={fontFamily} />
      <CursorGlow />

      {/* ── Capa 1: Base oscura — glow de marca sobre negro profundo ── */}
      <div
        className="pointer-events-none fixed inset-0 -z-30"
        style={{
          background: [
            `radial-gradient(ellipse 55% 40% at 18% 25%, ${hexAlpha(primaryColor, 0.28)}, transparent 65%)`,
            `radial-gradient(ellipse 42% 36% at 82% 74%, ${hexAlpha(accentColor, 0.22)}, transparent 60%)`,
            "#050709",
          ].join(", "),
        }}
      />

      {/* ── Capa 2: Foto del comercio (ambiente de color, no reemplaza el patrón) */}
      {bgPhotoUrl && (
        <div
          className="pointer-events-none fixed inset-0 -z-20"
          style={{
            backgroundImage: `url(${bgPhotoUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.12,
            filter: "blur(80px)",
          }}
        />
      )}

      {/* ── Capa 3: Neural canvas — grid + destellos, siempre encima ─ */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <AnimatedGrid className="absolute inset-0" dark lineOpacity={0.07} accentOpacity={0.28} />
      </div>

      {/* ── Mobile overlay ──────────────────────────────────────── */}
      {mobileOpen && (
        <button className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden" onClick={() => setMobileOpen(false)} type="button" aria-label="Cerrar menú" />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`glass-sidebar fixed inset-y-0 left-0 z-40 flex flex-col shadow-2xl transition-all duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1.2)] lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${open ? "w-[min(19rem,86vw)] lg:w-[19rem]" : "w-[19rem] lg:w-[5.4rem]"}`}
        style={{ background: hexAlpha(primaryColor, 0.88) }}
      >
        {/* header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <LogoMark brand={brand} />
            <div className={open ? "block" : "hidden"}>
              <p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: secondaryColor }}>
                {brand?.plan ? `Plan ${brand.plan}` : "BarberLab"}
              </p>
              <h1 className="truncate text-sm font-black text-white">{title}</h1>
            </div>
          </div>
          <button
            className="hidden rounded-xl border border-white/15 bg-white/10 p-2 text-white/70 backdrop-blur-sm hover:bg-white/20 hover:text-white lg:grid"
            onClick={() => setOpen((v) => !v)}
            type="button"
            aria-label="Contraer menú"
          >
            {open ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
          <button
            className="rounded-xl border border-white/15 bg-white/10 p-2 text-white/70 lg:hidden"
            onClick={() => setMobileOpen(false)}
            type="button"
            aria-label="Cerrar menú"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* nav body */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className={`mb-4 flex flex-wrap gap-2 ${open ? "justify-start" : "justify-center"}`}>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white/80">
              {open ? role : role.slice(0, 1)}
            </span>
          </div>

          {open && (
            <label className="mb-3 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-3 py-2.5 text-sm font-semibold text-white/70 backdrop-blur-sm focus-within:border-white/30 focus-within:bg-white/15">
              <Search className="size-4 shrink-0 text-white/50" />
              <input className="w-full bg-transparent text-white outline-none placeholder:text-white/40" placeholder="Buscar módulo" />
            </label>
          )}

          <nav className="grid gap-1">
            {nav.map((item, index) => {
              const style = navStyles[item.label] ?? navStyles.Dashboard;
              const Icon = style.icon;
              const shapeClass = style.shape === "circle" ? "rounded-full" : style.shape === "square" ? "rounded-xl" : "rounded-[14px]";
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <div key={item.href}>
                  {[3, 6].includes(index) && <div className="my-2 h-px bg-white/10" />}
                  <Link
                    href={item.href}
                    title={!open ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`group flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition-all duration-150 ${open ? "justify-start" : "justify-center"} ${isActive ? "text-white shadow-sm" : "text-white/70 hover:text-white"}`}
                    style={isActive
                      ? { background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, boxShadow: `0 14px 28px ${hexAlpha(primaryColor, 0.22)}` }
                      : undefined}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = hexAlpha(primaryColor, 0.34); }}
                    onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    <span className={`grid size-11 shrink-0 place-items-center shadow-sm transition-transform group-hover:scale-105 ${isActive ? "scale-105 shadow-md" : ""} ${shapeClass} ${style.tone}`}>
                      <Icon className="size-6" />
                    </span>
                    {open && <span className="flex-1 truncate text-[14px] leading-none">{item.label}</span>}
                    {open && isActive && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white opacity-80" />}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* alerts in sidebar */}
          {open && !alertsHidden && alerts.length > 0 && (
            <section className="mt-5 rounded-3xl border border-white/15 bg-white/10 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">Alarmas</p>
                <button className="rounded-lg p-1 text-white/40 hover:text-white/80" onClick={() => setAlertsHidden(true)} type="button" aria-label="Ocultar alarmas">
                  <X className="size-3.5" />
                </button>
              </div>
              <div className="mt-3 grid gap-2">
                {alerts.map((item) => (
                  <Link className={`flex items-start gap-2 rounded-xl px-3 py-2 text-xs font-bold ${item.tone} transition hover:opacity-80`} href={item.href} key={item.label}>
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-current opacity-60" />
                    <span>
                      <span className="block">{item.label}</span>
                      <span className="block font-medium opacity-70">{item.detail}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {open && alertsHidden && alerts.length > 0 && (
            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 px-3 py-3 text-xs font-bold text-white/60 hover:bg-white/10 hover:text-white/80" onClick={() => setAlertsHidden(false)} type="button">
              <Bell className="size-4" /> Mostrar alarmas
            </button>
          )}
        </div>

        {/* profile */}
        <div className={`grid gap-2 border-t border-white/10 p-3 ${open ? "" : "justify-items-center"}`}>
          <button
            className={`flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-white/12 ${open ? "" : "justify-center"}`}
            onClick={() => setProfileOpen(true)}
            type="button"
            title={!open ? "Perfil" : undefined}
          >
            {brand?.logoUrl ? (
              <img src={brand.logoUrl} alt="" className="size-9 shrink-0 rounded-full border-2 border-white/30 object-cover shadow-md" />
            ) : (
              <div className="grid size-9 shrink-0 place-items-center rounded-full text-sm font-black text-white shadow-md"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${hexAlpha(accentColor, 0.5)})` }}>
                {(brand?.nombre ?? role).slice(0, 1).toUpperCase()}
              </div>
            )}
            {open && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-white">{brand?.nombre ?? "Usuario"}</p>
                  <p className="truncate text-[11px] font-medium capitalize text-white/60">{role} · {brand?.negocioNombre ?? "BarberLab"}</p>
                </div>
                <ChevronRight className="size-3.5 shrink-0 text-white/40" />
              </>
            )}
          </button>
          <SignOutButton
            collapsed={!open}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-3 py-2.5 text-xs font-bold text-rose-100 transition hover:bg-rose-500/18 hover:text-white ${open ? "" : "size-11 p-0"}`}
          />
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────── */}
      <div className={`min-h-dvh pb-28 transition-[padding] duration-300 lg:pb-14 ${open ? "lg:pl-[19rem]" : "lg:pl-[5.2rem]"}`}>
        {/* topbar */}
        <header
          className="sticky top-0 z-20 border-b border-white/15 px-4 py-3 backdrop-blur-[32px]"
          style={{ background: hexAlpha(primaryColor, 0.06) }}
        >
          <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="rounded-2xl border border-slate-900/10 bg-white p-3 text-slate-700 lg:hidden" onClick={() => setMobileOpen(true)} type="button" aria-label="Abrir menú">
                <Menu className="size-4" />
              </button>
              <div>
                <Breadcrumb />
                <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">{title}</h2>
                <p className="mt-0.5 text-xs font-bold text-white/62">{headerIdentity}</p>
              </div>
            </div>
            <div className="relative hidden items-center gap-2 md:flex">
              <button
                className="relative grid size-10 place-items-center rounded-2xl border border-slate-900/10 bg-white text-slate-600 shadow-sm hover:border-cyan-300/40 hover:text-cyan-700"
                onClick={() => setAlertsOpen((v) => !v)}
                type="button"
                aria-label="Ver alarmas"
              >
                <Bell className="size-4.5" />
                {!alertsHidden && alerts.length > 0 && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,.9)]" />}
              </button>
              <button
                className="grid size-10 place-items-center rounded-2xl border border-slate-900/10 bg-white text-slate-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700"
                onClick={() => setProfileOpen(true)}
                type="button"
                aria-label="Ver perfil"
              >
                <UserCircle className="size-5" />
              </button>
              {alertsOpen && (
                <div className="absolute right-20 top-14 z-50 w-80 rounded-[1.6rem] border border-violet-100 bg-white/97 p-4 shadow-2xl shadow-slate-950/14 backdrop-blur-2xl">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-600">Alarmas activas</p>
                    <button className="text-xs font-black text-slate-400 hover:text-violet-600" onClick={() => setAlertsHidden((v) => !v)} type="button">
                      {alertsHidden ? "Mostrar" : "Ocultar"}
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2">
                    {(!alertsHidden ? alerts : []).map((item) => (
                      <Link className={`block rounded-xl px-3 py-3 text-xs font-bold ${item.tone} transition hover:opacity-80`} href={item.href} key={item.label} onClick={() => setAlertsOpen(false)}>
                        <span className="block">{item.label}</span>
                        <span className="mt-0.5 block font-medium opacity-75">{item.detail}</span>
                      </Link>
                    ))}
                    {alertsHidden && <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs font-bold text-slate-400">Alarmas ocultas</p>}
                    {!alertsHidden && alerts.length === 0 && <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs font-bold text-slate-400">Sin alarmas activas</p>}
                  </div>
                </div>
              )}
            </div>
            <button className="grid size-10 place-items-center rounded-2xl bg-white text-slate-700 md:hidden" onClick={() => setProfileOpen(true)} type="button" aria-label="Ver perfil">
              <UserCircle className="size-5" />
            </button>
          </div>
        </header>

        {/* page content with transition */}
        <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* ── Mobile bottom tab bar ────────────────────────────────── */}
      <BottomTabBar items={nav} />

      {/* ── Floating back button (mobile subpages) ───────────────── */}
      <BackButton />

      {/* ── Profile slide-over ──────────────────────────────────── */}
      {profileOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-slate-950/25 backdrop-blur-sm" onClick={() => setProfileOpen(false)} />
          <div className="fixed inset-y-0 right-0 z-50 flex w-[min(90vw,360px)] flex-col border-l border-white/20 bg-white/90 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: accentColor }}>Mi perfil</p>
              <button className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:text-slate-700" onClick={() => setProfileOpen(false)} type="button" aria-label="Cerrar"><X className="size-4" /></button>
            </div>
            <div className="flex flex-col items-center gap-3 p-6">
              {brand?.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.nombre} className="size-20 rounded-full border-4 border-white object-cover shadow-xl" />
              ) : (
                <div className="grid size-20 place-items-center rounded-full text-2xl font-black text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${accentColor}, ${primaryColor})` }}>
                  {(brand?.nombre ?? role).slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="text-center">
                <p className="text-lg font-black text-slate-900">{brand?.nombre ?? "Usuario"}</p>
                <p className="mt-0.5 text-sm capitalize text-slate-500">{role} · {brand?.negocioNombre ?? "BarberLab"}</p>
                {brand?.email && <p className="mt-0.5 text-xs text-slate-400">{brand.email}</p>}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <div className="grid gap-2">
                {brand?.plan && <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Plan</p><p className="mt-1 font-black capitalize text-slate-900">{brand.plan}</p></div>}
                {brand?.negocioNombre && <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Comercio</p><p className="mt-1 font-black text-slate-900">{brand.negocioNombre}</p></div>}
                {brand?.negocioEstado && <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Estado</p><p className="mt-1 font-black capitalize text-slate-900">{brand.negocioEstado}</p></div>}
              </div>
              <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Paleta del negocio</p>
                <div className="flex gap-2">
                  <span className="h-8 flex-1 rounded-xl shadow-sm" style={{ background: primaryColor }} />
                  <span className="h-8 flex-1 rounded-xl shadow-sm" style={{ background: secondaryColor }} />
                  <span className="h-8 flex-1 rounded-xl shadow-sm" style={{ background: accentColor }} />
                </div>
              </div>
            </div>
            <div className="grid gap-2 border-t border-slate-100 p-5">
              <Link href="/perfil" onClick={() => setProfileOpen(false)} className="flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-white transition hover:opacity-90" style={{ background: primaryColor }}>
                <UserCircle className="size-4" /> Ver perfil completo
              </Link>
              <SignOutButton className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:text-red-600" />
            </div>
          </div>
        </>
      )}

      <MrzHelpBot topics={topics} />
      <MrzSignature />
    </div>
  );
}
