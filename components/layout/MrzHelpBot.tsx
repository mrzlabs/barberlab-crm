"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Search, X, Zap } from "lucide-react";
import { generateMaylo } from "@/lib/maylo";

// ── Peek per-route ────────────────────────────────────────
const PEEK_PREFIX = "maylo_peek_";

function peekKey(pathname: string) {
  return PEEK_PREFIX + pathname.replace(/\//g, "_");
}

const PEEK_MESSAGES: Record<string, string> = {
  "/admin/agenda":        "Tienes citas pendientes de confirmar hoy",
  "/admin/turnos":        "Hay citas listas para cerrar y cobrar",
  "/admin/clientes":      "Tienes clientes en riesgo que no vuelven hace tiempo",
  "/admin/empleados":     "Revisa la producción del mes por especialista",
  "/admin/inventario":    "Verifica los items con stock mínimo activo",
  "/admin/gastos":        "Registra los gastos del día para mantener el margen real",
  "/admin/reportes":      "Tu rentabilidad del mes está lista para revisar",
  "/admin/configuracion": "Personaliza el branding con el logo de tu negocio",
};
const DEFAULT_PEEK = "Hola, soy Maylo. Estoy aquí para ayudarte";

// ── Contexto por ruta ─────────────────────────────────────
type DrawerCtx = { subtitle: string; intro: string; quickActions: { label: string; href: string }[] };

const DRAWER_CONTEXT: Record<string, DrawerCtx> = {
  "/admin/agenda": {
    subtitle: "Agenda · Operux CRM",
    intro: "Gestiona las citas del día. Los huecos libres se llenan al instante y las citas confirmadas reducen las inasistencias.",
    quickActions: [
      { label: "+ Nueva cita",       href: "/admin/agenda#nueva-cita" },
      { label: "Ver disponibilidad", href: "/admin/agenda#slots" },
      { label: "Bloqueos",           href: "/admin/agenda" },
    ],
  },
  "/admin/turnos": {
    subtitle: "Caja del día · Operux CRM",
    intro: "Cierra los turnos y cuadra la caja. Cada cierre alimenta los reportes de comisiones e inventario automáticamente.",
    quickActions: [
      { label: "Cerrar turno",  href: "/admin/turnos" },
      { label: "Ver caja",      href: "/admin/turnos" },
      { label: "Reportes",      href: "/admin/reportes" },
    ],
  },
  "/admin/clientes": {
    subtitle: "CRM clientes · Operux CRM",
    intro: "Base de clientes con estados automáticos: VIP, Frecuente, En riesgo. Un mensaje a tiempo recupera clientes inactivos.",
    quickActions: [
      { label: "+ Nuevo cliente", href: "/admin/clientes" },
      { label: "Ver historial",   href: "/admin/clientes" },
      { label: "Exportar",        href: "/admin/clientes" },
    ],
  },
  "/admin/empleados": {
    subtitle: "Equipo operativo · Operux CRM",
    intro: "Gestiona el equipo. La producción del mes y comisiones se calculan automáticamente con cada turno cerrado.",
    quickActions: [
      { label: "+ Nuevo empleado", href: "/admin/empleados" },
      { label: "Ver producción",   href: "/admin/empleados" },
      { label: "Comisiones",       href: "/admin/reportes" },
    ],
  },
  "/admin/inventario": {
    subtitle: "Inventario · Operux CRM",
    intro: "Controla el stock de insumos. Los items bajo el mínimo aparecen resaltados automáticamente.",
    quickActions: [
      { label: "+ Nuevo item",        href: "/admin/inventario" },
      { label: "Registrar movimiento", href: "/admin/inventario" },
      { label: "Ver alertas",          href: "/admin/inventario" },
    ],
  },
  "/admin/gastos": {
    subtitle: "Gastos · Operux CRM",
    intro: "Registra los gastos operacionales. Cada gasto impacta directamente el margen bruto y la utilidad neta.",
    quickActions: [
      { label: "+ Nuevo gasto",   href: "/admin/gastos" },
      { label: "Ver categorías",  href: "/admin/gastos" },
      { label: "Reportes",        href: "/admin/reportes" },
    ],
  },
  "/admin/reportes": {
    subtitle: "Reportes · Operux CRM",
    intro: "Ingresos, margen bruto, utilidad neta, comisiones y ticket promedio. Filtra por rango o por preset.",
    quickActions: [
      { label: "Ver ingresos",  href: "/admin/reportes" },
      { label: "Comisiones",    href: "/admin/reportes" },
      { label: "Exportar CSV",  href: "/admin/reportes" },
    ],
  },
  "/admin/configuracion": {
    subtitle: "Configuración · Operux CRM",
    intro: "Personaliza el branding, WhatsApp y tipografía. El CRM extrae la paleta de colores desde el logo automáticamente.",
    quickActions: [
      { label: "Branding",    href: "/admin/configuracion" },
      { label: "WhatsApp",    href: "/admin/configuracion" },
      { label: "Apariencia",  href: "/admin/configuracion" },
    ],
  },
};

const DEFAULT_CTX: DrawerCtx = {
  subtitle: "Asistente Operativo · Operux CRM",
  intro: "Bienvenido a Operux CRM. Selecciona un módulo para comenzar o usa el buscador para encontrar una función específica.",
  quickActions: [
    { label: "Agenda",   href: "/admin/agenda" },
    { label: "Caja",     href: "/admin/turnos" },
    { label: "Reportes", href: "/admin/reportes" },
  ],
};

// ── Module data ───────────────────────────────────────────
type Tip    = { title: string; steps: string[] };
type Module = { id: string; label: string; href: string; emoji: string; color: string; bg: string; tips: Tip[] };

const MODULES: Module[] = [
  {
    id: "agenda", label: "Agenda", href: "/admin/agenda",
    emoji: "📅", color: "#27C3D8", bg: "#06303a",
    tips: [
      { title: "Crear una cita", steps: ["Selecciona Cliente", "Selecciona Servicio", "Selecciona Especialista", "Elige Fecha", "Haz clic en Consultar horarios", "Elige un slot y crea la cita"] },
      { title: "Confirmar una cita", steps: ["Ubica la tarjeta de la cita en la lista", "Cambia el estado a Confirmada"] },
      { title: "Bloquear agenda", steps: ["Ve a la sección Bloqueos", "Selecciona el empleado", "Define rango de fechas inicio y fin", "Guarda el bloqueo"] },
      { title: "Agregar horario", steps: ["Ve a la sección Disponibilidad", "Selecciona el empleado", "Elige el día de la semana", "Define hora inicio y hora fin", "Guarda el horario"] },
    ],
  },
  {
    id: "turnos", label: "Turnos y Caja", href: "/admin/turnos",
    emoji: "💰", color: "#F5C400", bg: "#3a2f00",
    tips: [
      { title: "Cerrar un turno", steps: ["Ve a Turnos", "Selecciona la cita a cerrar", "Ingresa precio final", "Ingresa propina (opcional)", "Selecciona método de pago", "Haz clic en Cerrar turno"] },
      { title: "Ver arqueo de caja", steps: ["En la vista Turnos aparece el resumen del día", "Verás el total por método: efectivo, transferencia, tarjeta"] },
      { title: "Métodos de pago disponibles", steps: ["Efectivo", "Transferencia", "Tarjeta"] },
    ],
  },
  {
    id: "clientes", label: "Clientes", href: "/admin/clientes",
    emoji: "👥", color: "#a79df0", bg: "#241f47",
    tips: [
      { title: "Crear un cliente", steps: ["Haz clic en Nuevo cliente", "Ingresa nombre y teléfono (requeridos)", "Agrega email y notas (opcional)", "Guarda el cliente"] },
      { title: "Ver historial", steps: ["En la tabla de clientes", "Haz clic en el botón Historial de la fila del cliente"] },
      { title: "Estados CRM automáticos", steps: ["Nuevo: 1 visita total", "Frecuente: 2–5 visitas en los últimos 60 días", "VIP: 6 o más visitas totales", "En riesgo: sin visitas hace más de 45 días"] },
    ],
  },
  {
    id: "empleados", label: "Empleados", href: "/admin/empleados",
    emoji: "👤", color: "#5fb98a", bg: "#1f2a22",
    tips: [
      { title: "Crear un empleado", steps: ["Haz clic en Nuevo empleado", "Ingresa nombre, email y contraseña inicial", "Selecciona especialidad y define comisión %", "Guarda — el empleado puede iniciar sesión de inmediato"] },
      { title: "Ver producción del mes", steps: ["En la tabla de empleados", "La columna Producción mes muestra la suma de turnos cerrados este mes"] },
      { title: "Cómo funciona la comisión", steps: ["Se calcula sobre el precio final del turno", "Según el % configurado en el perfil del empleado"] },
    ],
  },
  {
    id: "inventario", label: "Inventario", href: "/admin/inventario",
    emoji: "📦", color: "#fdba74", bg: "#431407",
    tips: [
      { title: "Agregar un item", steps: ["Haz clic en Nuevo item", "Define SKU, nombre, categoría y unidad", "Ingresa stock actual, costo unitario y stock mínimo", "Guarda el item"] },
      { title: "Registrar movimiento Kardex", steps: ["Ve a Kardex", "Selecciona el insumo", "Elige tipo: entrada, salida o ajuste", "Ingresa cantidad y motivo", "Guarda el movimiento"] },
      { title: "Alertas de stock mínimo", steps: ["Items con stock igual o menor al mínimo configurado", "Aparecen resaltados en la tabla de inventario"] },
    ],
  },
  {
    id: "gastos", label: "Gastos", href: "/admin/gastos",
    emoji: "📊", color: "#f87171", bg: "#3a0f0f",
    tips: [
      { title: "Registrar un gasto", steps: ["Haz clic en Nuevo gasto", "Selecciona la categoría", "Ingresa monto y fecha", "Agrega descripción (opcional)", "Guarda el gasto"] },
      { title: "Categorías disponibles", steps: ["Arriendo", "Servicios públicos", "Nómina", "Insumos", "Marketing", "Otros"] },
    ],
  },
  {
    id: "reportes", label: "Reportes", href: "/admin/reportes",
    emoji: "📈", color: "#5A82EE", bg: "#0f1a3a",
    tips: [
      { title: "Filtrar por fecha", steps: ["Usa el selector Desde / Hasta", "O elige un preset: Hoy, Esta semana, Este mes"] },
      { title: "Métricas disponibles", steps: ["Ingresos totales", "Utilidad neta", "Margen bruto", "Total de comisiones", "Ticket promedio"] },
      { title: "Exportar CSV y PDF", steps: ["Usa los botones CSV o PDF en la parte superior del reporte"] },
      { title: "Rankings del periodo", steps: ["Servicio líder: el más vendido", "Especialista líder: el de mayor producción"] },
    ],
  },
  {
    id: "configuracion", label: "Configuración", href: "/admin/configuracion",
    emoji: "⚙️", color: "#8a8a9c", bg: "#1a1a26",
    tips: [
      { title: "Branding y paleta de colores", steps: ["Ve a Configuración → Branding", "Sube el logo del negocio", "El CRM extrae la paleta de colores automáticamente"] },
      { title: "WhatsApp templates", steps: ["Ve a Configuración → WhatsApp", "Ingresa el número del negocio", "Configura plantillas de confirmación, recordatorio y seguimiento"] },
      { title: "Cambiar fuente del CRM", steps: ["Ve a Configuración → Apariencia", "Usa el selector de tipografía", "El cambio se aplica globalmente"] },
    ],
  },
];

const PATH_TO_MODULE: Record<string, string> = {
  "/admin/agenda":        "agenda",
  "/admin/turnos":        "turnos",
  "/admin/clientes":      "clientes",
  "/admin/empleados":     "empleados",
  "/admin/inventario":    "inventario",
  "/admin/gastos":        "gastos",
  "/admin/reportes":      "reportes",
  "/admin/configuracion": "configuracion",
};

// ── BotRobot ──────────────────────────────────────────────
function BotRobot() {
  return (
    <span
      className="bot-robot-svg"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: generateMaylo({ eyes: "open", arms: "wave", glow: true }) }}
    />
  );
}

type HelpTopic = { title: string; body: string; steps: string[]; tips?: string[]; cta?: string; href?: string };

// ── Component ─────────────────────────────────────────────
export function MrzHelpBot({ topics }: { topics?: HelpTopic[] }) {
  const [open, setOpen]                     = useState(false);
  const [peekVisible, setPeekVisible]       = useState(false);
  const [botX, setBotX]                     = useState(0);
  const [mounted, setMounted]               = useState(false);
  const [zoneWidth, setZoneWidth]           = useState(0);
  const [search, setSearch]                 = useState("");
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [expandedTip, setExpandedTip]       = useState<string | null>(null);
  const zoneRef  = useRef<HTMLDivElement>(null);
  const router   = useRouter();
  const pathname = usePathname();
  const activeModuleId    = PATH_TO_MODULE[pathname] ?? null;
  const peekMsg           = PEEK_MESSAGES[pathname] ?? DEFAULT_PEEK;
  const activeModuleLabel = MODULES.find((m) => m.id === activeModuleId)?.label ?? "Operux CRM";

  const dismissPeek = useCallback(() => {
    setPeekVisible(false);
    sessionStorage.setItem(peekKey(pathname), "1");
  }, [pathname]);

  useEffect(() => { setMounted(true); }, []);

  // Per-route peek: aparece 3s después de cada cambio de pathname
  useEffect(() => {
    setPeekVisible(false);
    const key = peekKey(pathname);
    if (sessionStorage.getItem(key)) return;
    const id = window.setTimeout(() => setPeekVisible(true), 3000);
    return () => window.clearTimeout(id);
  }, [pathname]);

  // Ocultar peek cuando el drawer abre
  useEffect(() => { if (open) setPeekVisible(false); }, [open]);

  // Cuando el drawer abre, expande el módulo activo
  useEffect(() => {
    if (open) {
      setExpandedModule(activeModuleId);
      setExpandedTip(null);
      setSearch("");
    }
  }, [open, activeModuleId]);

  // Zone width para movimiento del bot
  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;
    const readWidth = () => setZoneWidth(zone.getBoundingClientRect().width);
    readWidth();
    const ro = new ResizeObserver(readWidth);
    ro.observe(zone);
    return () => ro.disconnect();
  }, []);

  // Movimiento suave horizontal
  useEffect(() => {
    if (open) return;
    const travel = Math.max(0, zoneWidth - 110);
    const targets = [0, -travel * 0.22, -travel * 0.48, -travel * 0.76, -travel * 0.34, -travel * 0.62, -travel * 0.12];
    let idx = 0;
    const id = window.setInterval(() => {
      idx = (idx + 1) % targets.length;
      setBotX(targets[idx]);
    }, 4200);
    return () => window.clearInterval(id);
  }, [open, zoneWidth]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Filtrar módulos por búsqueda
  const filteredModules = search.trim()
    ? MODULES.map((m) => ({
        ...m,
        tips: m.tips.filter(
          (t) =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.steps.some((s) => s.toLowerCase().includes(search.toLowerCase())),
        ),
      })).filter((m) => m.tips.length > 0 || m.label.toLowerCase().includes(search.toLowerCase()))
    : MODULES;

  const panel = open && mounted
    ? createPortal(
        <>
          <div className="mrz-drawer-scrim" onClick={() => setOpen(false)} />
          <div
            className="mrz-drawer-panel"
            style={{ animation: "mayloSlideIn 0.28s cubic-bezier(0.4,0,0.2,1)" }}
          >
            {/* Header */}
            <div className="mrz-drawer-top">
              <div className="mrz-drawer-avatar">
                <span dangerouslySetInnerHTML={{ __html: generateMaylo({ eyes: "open", arms: "wave", glow: true, panel: true }) }} />
              </div>
              <div className="mrz-drawer-id">
                <strong>Maylo</strong>
                <span>Asistente Operativo · Operux CRM</span>
              </div>
              <button type="button" className="mrz-drawer-close" onClick={() => setOpen(false)} aria-label="Cerrar ayuda">
                <X className="size-4" />
              </button>
            </div>

            {/* Buscador */}
            <div className="mrz-drawer-search">
              <Search className="size-3.5" />
              <input
                type="text"
                placeholder="Busca una función o módulo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mrz-drawer-search-input"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} className="mrz-drawer-search-clear">
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Módulos */}
            <div className="mrz-drawer-modules">
              {filteredModules.map((mod) => {
                const isExpanded = search.trim() ? mod.tips.length > 0 : expandedModule === mod.id;
                return (
                  <div key={mod.id} className="mrz-drawer-module">
                    <button
                      type="button"
                      className="mrz-drawer-module-head"
                      onClick={() => {
                        if (!search.trim()) {
                          setExpandedModule(isExpanded ? null : mod.id);
                          setExpandedTip(null);
                        }
                      }}
                    >
                      <span
                        className="mrz-drawer-module-icon"
                        style={{ background: mod.bg, color: mod.color }}
                        aria-hidden="true"
                      >
                        {mod.emoji}
                      </span>
                      <span className="mrz-drawer-module-label">{mod.label}</span>
                      <span className="mrz-drawer-module-count">{mod.tips.length}</span>
                      {!search.trim() && (
                        <ChevronDown
                          className="size-3.5 transition-transform"
                          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", color: "#6a6a7c" }}
                        />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mrz-drawer-tips-list">
                        {mod.tips.map((tip, ti) => {
                          const tipKey = `${mod.id}:${ti}`;
                          const tipExpanded = expandedTip === tipKey;
                          return (
                            <div key={tipKey} className="mrz-drawer-tip">
                              <button
                                type="button"
                                className="mrz-drawer-tip-head"
                                onClick={() => setExpandedTip(tipExpanded ? null : tipKey)}
                              >
                                <span
                                  className="mrz-drawer-dot"
                                  style={{ background: mod.color, boxShadow: `0 0 6px ${mod.color}` }}
                                />
                                <span className="mrz-drawer-tip-title">{tip.title}</span>
                                <ChevronDown
                                  className="size-3 flex-none transition-transform"
                                  style={{ transform: tipExpanded ? "rotate(180deg)" : "rotate(0deg)", color: "#6a6a7c" }}
                                />
                              </button>
                              {tipExpanded && (
                                <ol className="mrz-drawer-steps">
                                  {tip.steps.map((step, si) => (
                                    <li key={si}>
                                      <span
                                        className="mrz-drawer-step-num"
                                        style={{ background: mod.bg, color: mod.color }}
                                      >
                                        {si + 1}
                                      </span>
                                      {step}
                                    </li>
                                  ))}
                                </ol>
                              )}
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          className="mrz-drawer-go-btn"
                          style={{ borderColor: mod.color + "44", color: mod.color }}
                          onClick={() => { router.push(mod.href); setOpen(false); }}
                        >
                          <ArrowRight className="size-3" /> Ir a {mod.label}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredModules.length === 0 && (
                <p className="mrz-drawer-empty">
                  No encontré nada. Prueba con: agenda, caja, clientes
                </p>
              )}
            </div>

            {/* CTA */}
            <button type="button" className="mrz-drawer-cta" onClick={() => setOpen(false)}>
              <Zap className="size-4" /> ¡Listo, a trabajar!
            </button>
          </div>
        </>,
        document.body,
      )
    : null;

  return (
    <div className="mrz-bot-zone" ref={zoneRef}>
      {panel}

      {/* Peek bubble */}
      {peekVisible && mounted && (
        <div
          className="mrz-peek"
          // z-30: por debajo del sidebar (z-40) y del drawer de perfil (z-50)
          // para no tapar "Cerrar sesión" ni el menú en móvil.
          style={{ position: "fixed", bottom: 100, right: 26, zIndex: 30, animation: "peekIn 0.28s cubic-bezier(0.4,0,0.2,1)" }}
        >
          <div className="mrz-peek-head">
            <p className="mrz-peek-msg">{peekMsg}</p>
            <button type="button" className="mrz-peek-close" onClick={dismissPeek} aria-label="Cerrar notificación">
              <X className="size-3" />
            </button>
          </div>
          <button type="button" className="mrz-peek-cta" onClick={() => { dismissPeek(); setOpen(true); }}>
            Abrir ayuda <ArrowRight className="size-3" />
          </button>
        </div>
      )}

      {/* FAB */}
      <button
        className={`mrz-bot-btn ${open ? "active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        type="button"
        aria-label="Abrir ayuda Maylo"
        style={{
          transform: `translateX(${botX}px)`,
          transition: open ? "none" : "transform 3.2s cubic-bezier(0.45,0.05,0.25,1)",
        }}
      >
        <BotRobot />
      </button>
    </div>
  );
}
