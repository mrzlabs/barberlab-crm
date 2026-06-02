"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeApplier } from "@/components/layout/ThemeApplier";
import { NeuralCanvas } from "@/components/layout/NeuralCanvas";
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
  ArrowLeft,
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

function LogoMark({ brand, onExpand }: { brand?: CurrentProfile; onExpand?: (url: string) => void }) {
  if (brand?.logoUrl) {
    return (
      <button
        aria-label="Ver foto del negocio"
        className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/50 bg-white shadow-xl shadow-violet-950/15 transition hover:scale-[1.03]"
        onClick={() => onExpand?.(brand.logoUrl!)}
        type="button"
      >
        <Image alt={brand.negocioNombre || "Logo"} className="object-cover" fill sizes="48px" src={brand.logoUrl} unoptimized />
      </button>
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

// ─── Per-item icon colors ────────────────────────────────────────────────────
const ICON_COLORS: Record<string, string> = {
  "Dashboard":     "#60a5fa",
  "Agenda":        "#34d399",
  "Turnos":        "#f59e0b",
  "Gastos":        "#f87171",
  "Inventario":    "#a78bfa",
  "Servicios":     "#38bdf8",
  "Empleados":     "#fb923c",
  "Clientes":      "#e879f9",
  "Reportes":      "#4ade80",
  "Configuracion": "#94a3b8",
  "Marketing":     "#f472b6",
};

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
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
  const [moduleSearch, setModuleSearch] = useState("");
  const alertsRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  // Close alerts dropdown on click-outside or Escape
  useEffect(() => {
    if (!alertsOpen) return;
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") setAlertsOpen(false); }
    function handleClick(e: MouseEvent) {
      if (alertsRef.current && !alertsRef.current.contains(e.target as Node)) setAlertsOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [alertsOpen]);
  const topics = helpTopics[role];

  const primaryColor  = brand?.colorPrimario  || "#111827";
  const secondaryColor = brand?.colorSecundario || "#22d3ee";
  const accentColor   = brand?.colorAcento    || "#7c3aed";
  const bgPhotoUrl    = configVisual?.bgPhotoUrl;
  const fontFamily = configVisual?.fontFamily || brand?.fuente || "Inter";
  const isDark = configVisual?.darkMode !== false;

  // Sync theme + neural vars to documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--neural-opacity", isDark ? "0.55" : "0.35");
    root.style.setProperty("--neural-line-opacity", isDark ? "0.4" : "0.22");
    root.style.setProperty("--neural-primary", isDark ? "#7c3aed" : primaryColor);
  }, [isDark, primaryColor]);

  // Sync sidebar width so MrzSignature doesn't overlap sidebar
  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-w", open ? "220px" : "56px");
  }, [open]);
  const roleLabel = role === "super_admin" ? "Super Admin MRZLABS" : role === "admin" ? "Administrador" : role === "empleado" ? "Empleado" : "Cliente";

  const homeHref = role === "admin" ? "/admin/dashboard" : role === "empleado" ? "/empleado/mi-agenda" : role === "cliente" ? "/cliente/mis-citas" : null;
  const homeLabel = role === "admin" ? "Dashboard" : role === "empleado" ? "Mi agenda" : role === "cliente" ? "Mis citas" : null;
  const isHome = homeHref ? pathname === homeHref : false;
  // In header: show negocioNombre for admin/empleado/cliente, brand name for super_admin
  const headerIdentity = role === "super_admin"
    ? `${brand?.nombre ?? "Super Admin"} / ${roleLabel}`
    : `${brand?.negocioNombre ?? brand?.nombre ?? "Negocio"} / ${roleLabel}`;

  return (
    <div
      className={`crm-shell min-h-dvh overflow-x-hidden ${isDark ? "text-white" : "text-slate-900"}`}
      data-theme={isDark ? "dark" : "light"}
      style={{
        ["--brand-primary" as string]: primaryColor,
        ["--brand-secondary" as string]: secondaryColor,
        ["--brand-accent" as string]: accentColor,
        ["--shell-panel" as string]: isDark ? hexAlpha(primaryColor, 0.92) : hexAlpha(primaryColor, 0.05),
        ["--shell-header" as string]: isDark ? hexAlpha(primaryColor, 0.88) : hexAlpha(primaryColor, 0.08),
        ["--shell-border" as string]: isDark ? hexAlpha(secondaryColor, 0.2) : hexAlpha(primaryColor, 0.14),
        ["--shell-muted" as string]: isDark ? hexAlpha(secondaryColor, 0.14) : hexAlpha(secondaryColor, 0.1),
        ["--card-bg" as string]: isDark
          ? `linear-gradient(135deg, ${hexAlpha(primaryColor, 0.72)}, ${hexAlpha(accentColor, 0.2)})`
          : `linear-gradient(135deg, rgba(255,255,255,.78), ${hexAlpha(secondaryColor, 0.16)}, ${hexAlpha(accentColor, 0.12)})`,
        ["--card-bg-strong" as string]: isDark
          ? `linear-gradient(135deg, ${hexAlpha(primaryColor, 0.9)}, ${hexAlpha(accentColor, 0.34)})`
          : `linear-gradient(135deg, rgba(255,255,255,.86), ${hexAlpha(primaryColor, 0.09)}, ${hexAlpha(secondaryColor, 0.14)})`,
        ["--card-border" as string]: isDark ? hexAlpha(secondaryColor, 0.22) : hexAlpha(primaryColor, 0.16),
        ["--card-shadow" as string]: isDark ? hexAlpha(accentColor, 0.18) : hexAlpha(accentColor, 0.12),
        ["--report-bar" as string]: isDark ? "#00cec9" : "#3b82f6",
        ["--report-axis" as string]: isDark ? "#cbd5e1" : "#475569",
        ["--report-grid" as string]: isDark ? "rgba(148,163,184,.25)" : "#e2e8f0",
        ["--report-tooltip-bg" as string]: isDark ? "#1e293b" : "#ffffff",
        ["--report-tooltip-text" as string]: isDark ? "#ffffff" : "#0f172a",
        ["--report-tooltip-border" as string]: isDark ? "rgba(255,255,255,.14)" : "#e2e8f0",
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
      {isDark && <CursorGlow />}

      {/* ── Fixed background layer ────────────────────────────── */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: -2,
          background: isDark
            ? [
                `radial-gradient(ellipse 55% 40% at 18% 25%, ${hexAlpha(primaryColor, 0.28)}, transparent 65%)`,
                `radial-gradient(ellipse 42% 36% at 82% 74%, ${hexAlpha(accentColor, 0.22)}, transparent 60%)`,
                "#050709",
              ].join(", ")
            : [
                `radial-gradient(ellipse 48% 32% at 18% 20%, ${hexAlpha(secondaryColor, 0.12)}, transparent 60%)`,
                `radial-gradient(ellipse 38% 30% at 82% 74%, ${hexAlpha(accentColor, 0.10)}, transparent 58%)`,
                "linear-gradient(135deg, #eef2f7 0%, #e8edf5 50%, #ede8f5 100%)",
              ].join(", "),
        }}
      />
      {isDark && bgPhotoUrl && (
        <div
          className="pointer-events-none fixed inset-0"
          style={{ zIndex: -1, backgroundImage: `url(${bgPhotoUrl})`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.12, filter: "blur(80px)" }}
        />
      )}

      {/* ── Neural canvas — full-screen fixed backdrop ────────── */}
      <div className="pointer-events-none fixed inset-0" style={{ zIndex: 0 }}>
        <NeuralCanvas
          className="h-full w-full"
          darkMode={isDark}
          primaryColor={primaryColor}
        />
      </div>

      {/* ── CRM shell content — sits above neural canvas ─────────── */}
      <div className="relative" style={{ zIndex: 1 }}>

      {/* ── Mobile overlay ──────────────────────────────────────── */}
      {mobileOpen && (
        <button className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden" onClick={() => setMobileOpen(false)} type="button" aria-label="Cerrar menú" />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col shadow-2xl transition-all duration-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${open ? "w-[min(220px,86vw)] lg:w-[220px]" : "w-[220px] lg:w-[56px]"}`}
        style={isDark
          ? { background: `linear-gradient(180deg, ${hexAlpha(primaryColor, 0.95)}, ${hexAlpha(accentColor, 0.18)}), #0f0f1a`, borderRight: `1px solid ${hexAlpha(secondaryColor, 0.18)}` }
          : { background: "rgba(248,250,252,0.97)", borderRight: "1px solid #e2e8f0" }}
      >
        {/* header */}
        <div className={`flex items-center justify-between gap-3 border-b p-4 ${isDark ? "border-white/10" : "border-slate-200"}`}>
          <div className="flex min-w-0 items-center gap-3">
            <LogoMark brand={brand} onExpand={setExpandedPhoto} />
            <div className={open ? "block" : "hidden"}>
              <p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: secondaryColor }}>
                {brand?.plan ? `Plan ${brand.plan}` : "BarberLab"}
              </p>
              <h1 className="truncate text-sm font-black crm-text-primary">{title}</h1>
            </div>
          </div>
          <button
            className="hidden rounded-lg border border-white/10 bg-white/8 p-1.5 text-white/60 hover:bg-white/15 hover:text-white lg:grid"
            onClick={() => setOpen((v) => !v)}
            type="button"
            aria-label={open ? "Contraer menú" : "Mostrar menú"}
            title={open ? "Contraer menú" : "Mostrar menú"}
            style={{ borderColor: hexAlpha(secondaryColor, 0.3), background: open ? hexAlpha(secondaryColor, 0.08) : hexAlpha(secondaryColor, 0.18), color: isDark ? "#e2e8f0" : primaryColor }}
          >
            {open ? <ChevronLeft className="size-3.5" /> : <ChevronRight className="size-3.5" />}
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
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div className={`mb-3 flex flex-wrap gap-2 ${open ? "justify-start px-1" : "justify-center"}`}>
            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${isDark ? "border-white/15 bg-white/8 text-white/60" : "border-slate-200 bg-slate-100 text-slate-500"}`}>
              {open ? role.replace("_", " ") : role.slice(0, 1)}
            </span>
          </div>

          {open && (
            <label className={`mb-2 flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs ${isDark ? "border-white/10 bg-white/6 text-white/60 focus-within:border-white/20" : "border-slate-200 bg-white text-slate-500 focus-within:border-slate-400"}`}>
              <Search className={`size-3.5 shrink-0 ${isDark ? "text-white/40" : "text-slate-400"}`} />
              <input
                className={`w-full bg-transparent outline-none text-xs ${isDark ? "text-white placeholder:text-white/35" : "text-slate-700 placeholder:text-slate-400"}`}
                placeholder="Buscar…"
                value={moduleSearch}
                onChange={(e) => setModuleSearch(e.target.value)}
              />
              {moduleSearch && (
                <button type="button" className={isDark ? "text-white/35 hover:text-white/60" : "text-slate-400 hover:text-slate-600"} onClick={() => setModuleSearch("")} aria-label="Limpiar">✕</button>
              )}
            </label>
          )}

          <nav className="grid gap-0.5">
            {nav.filter((item) => !moduleSearch || item.label.toLowerCase().includes(moduleSearch.toLowerCase())).map((item, index) => {
              const style = navStyles[item.label] ?? navStyles.Dashboard;
              const Icon = style.icon;
              const shapeClass = style.shape === "circle" ? "rounded-full" : style.shape === "square" ? "rounded-lg" : "rounded-[10px]";
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const iconColor = ICON_COLORS[item.label] ?? "#94a3b8";
              return (
                <div key={item.href}>
                  {[3, 6, 9].includes(index) && <div className={`my-1.5 h-px ${isDark ? "bg-white/8" : "bg-slate-200"}`} />}
                  <Link
                    href={item.href}
                    title={!open ? item.label : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-150 ${open ? "justify-start" : "justify-center"}`}
                    style={{
                      background: isActive
                        ? hexAlpha(primaryColor, isDark ? 0.19 : 0.12)
                        : undefined,
                      color: isActive
                        ? (isDark ? "#ffffff" : primaryColor)
                        : (isDark ? "rgba(255,255,255,0.75)" : "#1e293b"),
                    }}
                  >
                    <span
                      className={`grid size-7 shrink-0 place-items-center transition-transform group-hover:scale-105 ${isActive ? "scale-105" : ""} ${shapeClass}`}
                      style={{
                        background: isActive
                          ? hexAlpha(iconColor, isDark ? 0.24 : 0.16)
                          : hexAlpha(iconColor, isDark ? 0.12 : 0.07),
                        color: iconColor,
                        filter: isActive ? "brightness(1.3)" : undefined,
                        opacity: isActive ? 1 : 0.75,
                      }}
                    >
                      <Icon className="size-[15px]" />
                    </span>
                    {open && <span className="flex-1 truncate text-[13px] leading-none">{item.label}</span>}
                    {open && isActive && <span className="h-1.5 w-1.5 shrink-0 rounded-full opacity-90" style={{ backgroundColor: secondaryColor }} />}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* alerts in sidebar */}
          {open && !alertsHidden && alerts.length > 0 && (
            <section className={`mt-5 rounded-3xl border p-4 shadow-sm ${isDark ? "border-white/15 bg-white/10" : "border-slate-200 bg-white/80"}`}>
              <div className="flex items-center justify-between">
                <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${isDark ? "text-white/60" : "text-slate-500"}`}>Alarmas</p>
                <button className={`rounded-lg p-1 ${isDark ? "text-white/40 hover:text-white/80" : "text-slate-400 hover:text-slate-700"}`} onClick={() => setAlertsHidden(true)} type="button" aria-label="Ocultar alarmas">
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
        <div className={`border-t p-2 ${isDark ? "border-white/8" : "border-slate-200"} ${open ? "" : "flex flex-col items-center gap-1"}`}>
          <button
            className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-white/8 ${open ? "" : "justify-center"}`}
            onClick={() => setProfileOpen(true)}
            type="button"
            title={!open ? "Perfil" : undefined}
          >
            {brand?.logoUrl ? (
              <span className="relative size-7 shrink-0 overflow-hidden rounded-full border border-white/20 shadow-sm">
                <Image src={brand.logoUrl} alt="" className="object-cover" fill sizes="28px" unoptimized />
              </span>
            ) : (
              <div className="grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-black text-white shadow-sm"
                style={{ background: `linear-gradient(135deg, ${accentColor}, ${hexAlpha(accentColor, 0.5)})` }}>
                {(brand?.nombre ?? role).slice(0, 1).toUpperCase()}
              </div>
            )}
            {open && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold crm-text-primary">{brand?.nombre ?? "Usuario"}</p>
                <p className="truncate text-[10px] capitalize text-white/50">{role.replace("_", " ")}</p>
              </div>
            )}
          </button>
          <SignOutButton
            collapsed={!open}
            className={`flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/8 bg-white/5 px-2 py-1.5 text-xs font-medium text-rose-300/80 transition hover:bg-rose-500/15 hover:text-rose-200 ${open ? "" : "size-8 p-0"}`}
          />
        </div>
      </aside>
      {!open && (
        <button
          className="fixed left-[68px] top-4 z-50 hidden items-center gap-2 rounded-full border px-3 py-2 text-xs font-black shadow-lg backdrop-blur lg:flex"
          onClick={() => setOpen(true)}
          style={{
            borderColor: hexAlpha(secondaryColor, 0.36),
            background: isDark ? hexAlpha(primaryColor, 0.92) : "#ffffff",
            color: isDark ? "#ffffff" : primaryColor,
            boxShadow: `0 12px 34px ${hexAlpha(accentColor, 0.18)}`,
          }}
          type="button"
        >
          <ChevronRight className="size-3.5" />
          Mostrar menú
        </button>
      )}

      {/* ── Main area ───────────────────────────────────────────── */}
      <div className={`min-h-dvh pb-20 transition-all duration-300 lg:pb-8 ${open ? "lg:ml-[220px]" : "lg:ml-[56px]"}`}>
        {/* topbar */}
        <header
          className={`sticky top-0 z-20 flex h-[52px] items-center border-b px-4 ${isDark ? "border-white/8" : "border-slate-200"}`}
          style={{
            background: isDark ? hexAlpha(primaryColor, 0.86) : "rgba(255,255,255,0.92)",
            borderColor: isDark ? hexAlpha(secondaryColor, 0.12) : "#e2e8f0",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <button className={`rounded-lg border p-2 lg:hidden ${isDark ? "border-white/10 bg-white/8 text-white/70 hover:bg-white/15" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`} onClick={() => setMobileOpen(true)} type="button" aria-label="Abrir menú">
                <Menu className="size-4" />
              </button>
              {homeHref && !isHome && (
                <Link
                  href={homeHref}
                  className={`hidden items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition md:flex ${isDark ? "border-white/10 bg-white/6 text-white/70 hover:bg-white/12 hover:text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                  title={`Ir a ${homeLabel}`}
                >
                  <ArrowLeft className="size-3" />
                  {homeLabel}
                </Link>
              )}
              <div>
                <Breadcrumb />
                <h2 className="text-base font-bold tracking-tight crm-text-primary">{title}</h2>
              </div>
            </div>
            <div className="relative hidden items-center gap-1.5 md:flex">
              <button
                className={`relative grid size-8 place-items-center rounded-lg border transition ${isDark ? "border-white/10 bg-white/6 text-white/60 hover:bg-white/12 hover:text-white" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
                onClick={() => setAlertsOpen((v) => !v)}
                type="button"
                aria-label="Ver alarmas"
              >
                <Bell className="size-3.5" />
                {!alertsHidden && alerts.length > 0 && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,.9)]" />}
              </button>
              <button
                className={`grid size-8 place-items-center rounded-lg border transition ${isDark ? "border-white/10 bg-white/6 text-white/60 hover:bg-white/12 hover:text-white" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}
                onClick={() => setProfileOpen(true)}
                type="button"
                aria-label="Ver perfil"
              >
                <UserCircle className="size-4" />
              </button>
              <span className="ml-1 hidden text-xs crm-text-muted lg:block">{headerIdentity}</span>
              {alertsOpen && (
                <div ref={alertsRef} className="absolute right-16 top-12 z-50 w-72 rounded-xl border border-slate-700/60 bg-slate-900 p-3 shadow-2xl shadow-black/40">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Alarmas activas</p>
                    <button className="text-xs font-medium text-slate-500 hover:text-slate-300" onClick={() => setAlertsHidden((v) => !v)} type="button">
                      {alertsHidden ? "Mostrar" : "Ocultar"}
                    </button>
                  </div>
                  <div className="grid gap-1.5">
                    {(!alertsHidden ? alerts : []).map((item) => (
                      <Link className={`block rounded-lg px-3 py-2 text-xs font-medium ${item.tone} transition hover:opacity-80`} href={item.href} key={item.label} onClick={() => setAlertsOpen(false)}>
                        <span className="block font-bold">{item.label}</span>
                        <span className="mt-0.5 block opacity-70">{item.detail}</span>
                      </Link>
                    ))}
                    {alertsHidden && <p className="rounded-lg border border-dashed border-slate-700/50 p-3 text-center text-xs text-slate-500">Alarmas ocultas</p>}
                    {!alertsHidden && alerts.length === 0 && <p className="rounded-lg border border-dashed border-slate-700/50 p-3 text-center text-xs text-slate-500">Sin alarmas activas</p>}
                  </div>
                </div>
              )}
            </div>
            <button className={`grid size-8 place-items-center rounded-lg border md:hidden ${isDark ? "border-white/10 bg-white/6 text-white/60" : "border-slate-200 bg-white text-slate-500"}`} onClick={() => setProfileOpen(true)} type="button" aria-label="Ver perfil">
              <UserCircle className="size-4" />
            </button>
          </div>
        </header>

        {/* page content */}
        <main className="mx-auto max-w-[1280px] px-4 py-5 sm:px-5">
          <PageTransition>{children}</PageTransition>
        </main>

      </div>{/* end main area */}

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
                <button
                  aria-label="Expandir foto de perfil"
                  className="relative size-20 overflow-hidden rounded-full border-4 border-white shadow-xl transition hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-violet-200"
                  onClick={() => setExpandedPhoto(brand.logoUrl)}
                  type="button"
                >
                  <Image src={brand.logoUrl} alt={brand.nombre} className="object-cover" fill sizes="80px" unoptimized />
                </button>
              ) : (
                <div className="grid size-20 place-items-center rounded-full text-2xl font-black text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${accentColor}, ${primaryColor})` }}>
                  {(brand?.nombre ?? role).slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="text-center">
                <p className="text-lg font-black text-slate-900">{brand?.nombre ?? "Usuario"}</p>
                <p className="mt-0.5 text-sm text-slate-500">{roleLabel}</p>
                {brand?.email && <p className="mt-0.5 text-xs text-slate-400">{brand.email}</p>}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-4">
              <div className="grid gap-2">
                {/* super_admin: nombre, email, rol */}
                {role === "super_admin" && <>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Plataforma</p><p className="mt-1 font-black text-slate-900">BarberLab SaaS</p></div>
                  {brand?.email && <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Email</p><p className="mt-1 font-black text-slate-900">{brand.email}</p></div>}
                </>}
                {/* admin: nombre negocio, plan, estado */}
                {role === "admin" && <>
                  {brand?.negocioNombre && <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Comercio</p><p className="mt-1 font-black text-slate-900">{brand.negocioNombre}</p></div>}
                  {brand?.plan && <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Plan</p><p className="mt-1 font-black capitalize text-slate-900">{brand.plan}</p></div>}
                  {brand?.negocioEstado && <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Estado</p><p className="mt-1 font-black capitalize text-slate-900">{brand.negocioEstado}</p></div>}
                </>}
                {/* empleado: nombre, teléfono */}
                {role === "empleado" && <>
                  {brand?.telefono && <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Teléfono</p><p className="mt-1 font-black text-slate-900">{brand.telefono}</p></div>}
                  {brand?.negocioNombre && <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Comercio</p><p className="mt-1 font-black text-slate-900">{brand.negocioNombre}</p></div>}
                </>}
                {/* cliente: solo nombre */}
                {role === "cliente" && <>
                  {brand?.negocioNombre && <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Comercio</p><p className="mt-1 font-black text-slate-900">{brand.negocioNombre}</p></div>}
                </>}
              </div>
              {(role === "admin") && (
                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Paleta del negocio</p>
                  <div className="flex gap-2">
                    <span className="h-8 flex-1 rounded-xl shadow-sm" style={{ background: primaryColor }} />
                    <span className="h-8 flex-1 rounded-xl shadow-sm" style={{ background: secondaryColor }} />
                    <span className="h-8 flex-1 rounded-xl shadow-sm" style={{ background: accentColor }} />
                  </div>
                </div>
              )}
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

      </div>{/* end crm shell content */}

      <MrzSignature />

      <MrzHelpBot topics={topics} />
      {expandedPhoto && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/72 p-4 backdrop-blur-xl" onClick={() => setExpandedPhoto(null)}>
          <button className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 p-3 text-white transition hover:bg-white/20" onClick={() => setExpandedPhoto(null)} type="button" aria-label="Cerrar foto">
            <X className="size-5" />
          </button>
          <div className="relative aspect-square w-[min(86vw,560px)] overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-2xl shadow-violet-950/40" onClick={(event) => event.stopPropagation()}>
            <Image src={expandedPhoto} alt="Foto de perfil ampliada" className="object-cover" fill sizes="(max-width: 640px) 86vw, 560px" unoptimized priority />
          </div>
        </div>
      )}
    </div>
  );
}





