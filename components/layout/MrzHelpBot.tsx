"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, BarChart2, CalendarDays, CreditCard, X, Zap } from "lucide-react";
import { usePathname } from "next/navigation";
import { generateMaylo } from "@/lib/maylo";

const PEEK_KEY = "maylo_peek_seen";

const PEEK_MESSAGES: Record<string, string> = {
  "/admin/agenda":   "Revisa los turnos pendientes de hoy",
  "/admin/turnos":   "Hay citas listas para cerrar",
  "/admin/clientes": "Tienes clientes que no vuelven hace tiempo",
  "/admin/reportes": "Tu margen del mes está listo para revisar",
};

type DrawerContent = { subtitle: string; bubble: string; tips: string[] };

const DRAWER_CONTENT: Record<string, DrawerContent> = {
  "/admin/agenda": {
    subtitle: "Asistente Operativo · Agenda",
    bubble: "Esta es la agenda del día por especialista. Los huecos libres se pueden llenar al instante y las citas confirmadas reducen las inasistencias.",
    tips: [
      "Las citas en cian están en curso ahora mismo.",
      "Manda recordatorio por WhatsApp a los turnos de la tarde.",
      "Bloquea horarios con anticipación para evitar conflictos.",
    ],
  },
  "/admin/turnos": {
    subtitle: "Asistente Operativo · Caja",
    bubble: "Acá cierras los turnos del día. Cada cierre alimenta los reportes de caja, comisiones e inventario automáticamente.",
    tips: [
      "Registra propinas para que el reporte de comisiones sea exacto.",
      "El descuento aplicado afecta el margen bruto del día.",
      "Un turno cerrado actualiza el stock de insumos.",
    ],
  },
  "/admin/clientes": {
    subtitle: "Asistente Operativo · Clientes",
    bubble: "Aquí vive tu base de clientes. Los que no vuelven hace tiempo son oportunidades de recuperación — un mensaje a tiempo los trae de vuelta.",
    tips: [
      "Filtra clientes inactivos y lánzales una promo por WhatsApp.",
      "Los clientes frecuentes merecen trato VIP — cuídalos.",
      "Toca un cliente para ver su historial completo de citas.",
    ],
  },
  "/admin/reportes": {
    subtitle: "Asistente Operativo · Reportes",
    bubble: "Tus números de un vistazo: margen bruto, utilidad neta, ticket promedio y producción por empleado — todo en un solo lugar.",
    tips: [
      "Compara rangos de fecha para detectar tendencias.",
      "La utilidad neta descuenta gastos y comisiones.",
      "Exporta el reporte y compártelo con el equipo.",
    ],
  },
};

const DEFAULT_DRAWER: DrawerContent = {
  subtitle: "Asistente Operativo · Operux CRM",
  bubble: "Hola, soy Maylo. Estoy aquí para ayudarte a sacar el máximo provecho de Operux. ¿En qué módulo tienes dudas?",
  tips: [
    "Agenda y citas → programa y confirma sin conflictos.",
    "Caja y turnos → registra ventas y cierra el día.",
    "Reportes → margen, comisiones y ticket promedio en vivo.",
  ],
};

function BotRobot() {
  return (
    <span
      className="bot-robot-svg"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: generateMaylo({ eyes: 'open', arms: 'wave', glow: true }) }}
    />
  );
}

type HelpTopic = {
  title: string;
  body: string;
  steps: string[];
  tips?: string[];
  cta?: string;
  href?: string;
};

export function MrzHelpBot({ topics }: { topics?: HelpTopic[] }) {
  const [open, setOpen] = useState(false);
  const [peekVisible, setPeekVisible] = useState(false);
  const [botX, setBotX] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [zoneWidth, setZoneWidth] = useState(0);
  const zoneRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const peekMsg = PEEK_MESSAGES[pathname] ?? "Hola, soy Maylo. ¿En qué te ayudo hoy?";
  const drawerContent = DRAWER_CONTENT[pathname] ?? DEFAULT_DRAWER;

  const dismissPeek = useCallback(() => {
    setPeekVisible(false);
    sessionStorage.setItem(PEEK_KEY, "1");
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mostrar peek 2s después de montar, solo una vez por sesión
  useEffect(() => {
    if (sessionStorage.getItem(PEEK_KEY)) return;
    const id = window.setTimeout(() => {
      console.log('peek visible');
      setPeekVisible(true);
    }, 2000);
    return () => window.clearTimeout(id);
  }, []);

  // Ocultar peek cuando el drawer se abre (sin marcar sesión)
  useEffect(() => {
    if (open) setPeekVisible(false);
  }, [open]);

  useEffect(() => {
    const zone = zoneRef.current;
    if (!zone) return;
    const readWidth = () => setZoneWidth(zone.getBoundingClientRect().width);
    readWidth();
    const ro = new ResizeObserver(readWidth);
    ro.observe(zone);
    return () => ro.disconnect();
  }, []);

  // Movimiento suave horizontal dentro de toda la firma
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

  const panel = open && mounted
    ? createPortal(
        <>
          <div className="mrz-drawer-scrim" onClick={() => setOpen(false)} />
          <div
            className="mrz-drawer-panel"
            style={{ animation: "mayloSlideIn 0.28s cubic-bezier(0.4,0,0.2,1)" }}
          >
            <div className="mrz-drawer-top">
              <div className="mrz-drawer-avatar">
                <span
                  dangerouslySetInnerHTML={{
                    __html: generateMaylo({ eyes: 'open', arms: 'wave', glow: true, panel: true }),
                  }}
                />
              </div>
              <div className="mrz-drawer-id">
                <strong>Maylo</strong>
                <span>{drawerContent.subtitle}</span>
              </div>
              <button
                type="button"
                className="mrz-drawer-close"
                onClick={() => setOpen(false)}
                aria-label="Cerrar ayuda"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mrz-drawer-bubble">{drawerContent.bubble}</div>

            <div className="mrz-drawer-sec">Tips rápidos</div>
            <ul className="mrz-drawer-tips">
              {drawerContent.tips.map((tip) => (
                <li key={tip}><span className="mrz-drawer-dot" />{tip}</li>
              ))}
            </ul>

            <div className="mrz-drawer-sec">Acceso rápido</div>
            <div className="mrz-drawer-qa">
              <Link href="/admin/agenda"   onClick={() => setOpen(false)} className="mrz-drawer-qa-btn">
                <CalendarDays className="size-4" /> Agenda
              </Link>
              <Link href="/admin/turnos"   onClick={() => setOpen(false)} className="mrz-drawer-qa-btn">
                <CreditCard className="size-4" /> Caja
              </Link>
              <Link href="/admin/reportes" onClick={() => setOpen(false)} className="mrz-drawer-qa-btn">
                <BarChart2 className="size-4" /> Reportes
              </Link>
            </div>

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

      {/* Peek bubble — notificación contextual */}
      {peekVisible && mounted && (
        <div
          className="mrz-peek"
          style={{ position: "fixed", bottom: 100, right: 26, zIndex: 9999 }}
        >
          <div className="mrz-peek-head">
            <p className="mrz-peek-msg">{peekMsg}</p>
            <button
              type="button"
              className="mrz-peek-close"
              onClick={dismissPeek}
              aria-label="Cerrar notificación"
            >
              <X className="size-3" />
            </button>
          </div>
          <button
            type="button"
            className="mrz-peek-cta"
            onClick={() => { dismissPeek(); setOpen(true); }}
          >
            Abrir ayuda <ArrowRight className="size-3" />
          </button>
        </div>
      )}

      {/* Botón del bot — se mueve suavemente en el footer */}
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
