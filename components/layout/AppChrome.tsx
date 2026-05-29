"use client";

import Link from "next/link";
import { useEffect, useRef, useMemo, useState } from "react";
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
  TrendingUp,
  Package,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import type { UserRole } from "@/lib/auth/roles";

// ─── Types ───────────────────────────────────────────────────────────────────

type NavItem = { href: string; label: string };
type NavStyle = { icon: React.ComponentType<{ className?: string }>; tone: string };
type HelpTopic = {
  title: string;
  body: string;
  steps: string[];
  tips?: string[];
  cta?: string;
  href?: string;
};

// ─── Nav styles ──────────────────────────────────────────────────────────────

const navStyles: Record<string, NavStyle> = {
  Dashboard:    { icon: LayoutDashboard, tone: "from-blue-500 to-cyan-400 text-white" },
  Agenda:       { icon: CalendarDays,    tone: "from-emerald-500 to-teal-400 text-white" },
  Turnos:       { icon: ClipboardCheck,  tone: "from-orange-500 to-amber-300 text-white" },
  Gastos:       { icon: CreditCard,      tone: "from-rose-500 to-pink-400 text-white" },
  Inventario:   { icon: Boxes,           tone: "from-lime-500 to-emerald-400 text-slate-950" },
  Servicios:    { icon: Scissors,        tone: "from-violet-600 to-fuchsia-400 text-white" },
  Empleados:    { icon: Users,           tone: "from-sky-500 to-blue-500 text-white" },
  Clientes:     { icon: Users,           tone: "from-teal-500 to-cyan-400 text-white" },
  Reportes:     { icon: Settings2,       tone: "from-slate-800 to-violet-600 text-white" },
  "Mi agenda":  { icon: CalendarDays,    tone: "from-emerald-500 to-teal-400 text-white" },
  "Cerrar turno":{ icon: ClipboardCheck, tone: "from-orange-500 to-amber-300 text-white" },
  Reservar:     { icon: CalendarDays,    tone: "from-cyan-500 to-blue-500 text-white" },
  "Mis citas":  { icon: ClipboardCheck,  tone: "from-violet-600 to-fuchsia-400 text-white" },
};

// ─── Help topics (Odoo-style detail) ─────────────────────────────────────────

const helpTopics: Record<UserRole, HelpTopic[]> = {
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
      body: "El módulo de gastos registra todos los egresos del negocio: arriendos, servicios, compras de insumos, comisiones externas y gastos operativos. Estos datos alimentan el flujo de caja en los reportes.",
      steps: [
        "Registra cada gasto con categoría, monto, fecha y método de pago.",
        "Asigna gastos a categorías como Insumos, Arriendo, Marketing, Personal u Otros.",
        "Los gastos recurrentes (arriendo, servicios públicos) se pueden marcar como mensuales.",
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
        "La vista de productos muestra qué insumos están críticos, normales o con exceso.",
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
      body: "El catálogo de servicios define qué ofrece el negocio: corte, barba, coloración, tratamientos, combos. Cada servicio tiene precio, duración, costo de insumos y especialidades asignadas.",
      steps: [
        "Crea un servicio con nombre, descripción, precio de venta y duración estimada.",
        "Asigna el costo de insumos para calcular margen real por servicio.",
        "Vincula el servicio a los empleados que pueden realizarlo (por especialidad).",
        "Los servicios activos aparecen en la vista de reserva del cliente.",
        "Desactiva servicios temporalmente sin eliminarlos para mantener el historial.",
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
      body: "Gestiona el equipo: crea perfiles con especialidad, estado, comisión y credenciales de acceso. Cada empleado ve solo sus citas y puede cerrar sus propios turnos.",
      steps: [
        "Crea el perfil del empleado con nombre, especialidad y porcentaje de comisión.",
        "Asigna las credenciales de acceso para que el empleado entre al CRM como rol 'empleado'.",
        "Carga los horarios semanales del empleado (días y horas disponibles).",
        "Registra bloqueos para vacaciones, festivos o citas personales.",
        "El estado 'activo/inactivo' controla si el empleado aparece disponible para agendar.",
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
        "Usa el filtro por fecha de última visita para identificar clientes inactivos.",
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
      body: "Como empleado, tu agenda muestra todas tus citas del día organizadas por hora. Puedes ver el nombre del cliente, el servicio asignado, la duración estimada y el estado de cada cita.",
      steps: [
        "Revisa tu agenda al inicio del turno para conocer la carga del día.",
        "Las citas en estado 'pendiente' necesitan tu confirmación antes de atender.",
        "Contacta al cliente por WhatsApp si necesitas confirmar horario o datos del servicio.",
        "Marca la cita como 'en proceso' cuando el cliente llega y como 'realizada' al terminar.",
        "Las citas realizadas quedan disponibles para cierre de turno desde la sección de turnos.",
      ],
      tips: [
        "Si un cliente no llega, márcala como 'no asistió' para mantener el registro limpio.",
        "El admin puede ver tu agenda completa en cualquier momento desde /admin/agenda.",
      ],
      cta: "Ver mi agenda",
      href: "/empleado/mi-agenda",
    },
    {
      title: "Cerrar turno",
      body: "El cierre de turno es el paso final de cada atención. Aquí registras el cobro: precio final, propina, método de pago y descuento. Este registro alimenta la caja del negocio y tus comisiones.",
      steps: [
        "Entra a 'Cerrar turno' después de realizar el servicio.",
        "Selecciona la cita que acabas de completar de la lista de citas realizadas.",
        "Confirma el precio final (puede diferir del base por servicios adicionales).",
        "Registra si el cliente dio propina y el método de pago usado.",
        "Agrega observaciones si el servicio fue diferente al original.",
        "Guarda el turno: el registro queda en caja y se calcula tu comisión automáticamente.",
      ],
      tips: [
        "Cierra cada turno en el momento para evitar errores al final del día.",
        "La propina es tuya y queda registrada por separado de la comisión del servicio.",
      ],
      cta: "Cerrar turno",
      href: "/empleado/cerrar-turno",
    },
  ],
  cliente: [
    {
      title: "Reservar cita",
      body: "Reserva tu próxima cita en segundos: elige el servicio que quieres, el especialista de tu preferencia y el horario disponible. El sistema solo te muestra horas reales, no slots vacíos.",
      steps: [
        "Entra a 'Reservar' y elige el servicio que necesitas (corte, barba, combo, etc.).",
        "Selecciona el especialista de tu preferencia o elige 'cualquier disponible'.",
        "El sistema muestra solo los horarios reales disponibles para ese empleado.",
        "Confirma el horario y escribe una nota si tienes alguna preferencia especial.",
        "Tu cita queda en estado 'reservada'. El negocio la confirma cuando abre el turno.",
        "Recibes confirmación y puedes revisar el estado en 'Mis citas'.",
      ],
      tips: [
        "Reserva con al menos 24 horas de anticipación para asegurar tu horario.",
        "Si necesitas cambiar la cita, cancela desde 'Mis citas' y vuelve a reservar.",
      ],
      cta: "Reservar ahora",
      href: "/cliente/reservar",
    },
    {
      title: "Mis citas",
      body: "En 'Mis citas' puedes ver el historial completo de tus reservas: pasadas, próximas y pendientes de confirmación. También puedes ver el detalle de cada servicio recibido.",
      steps: [
        "Consulta el estado de tu reserva más reciente en la parte superior.",
        "Las citas 'reservadas' están esperando confirmación del negocio.",
        "Las citas 'confirmadas' están agendadas y listas para la fecha indicada.",
        "Puedes cancelar una cita con al menos 2 horas de anticipación.",
        "El historial muestra todos los servicios que has recibido y las fechas.",
      ],
      tips: [
        "Activa notificaciones en tu teléfono para recibir confirmaciones por WhatsApp.",
        "Si tienes dudas sobre una cita, contacta directamente al negocio con el número de reserva.",
      ],
      cta: "Ver mis citas",
      href: "/cliente/mis-citas",
    },
    {
      title: "Productos",
      body: "Descubre los productos de cuidado capilar y barbería disponibles para compra en sede. Puedes consultar los recomendados según tu tipo de cabello o solicitar uno por WhatsApp.",
      steps: [
        "Revisa el catálogo de productos disponibles en la sección de reservas.",
        "Consulta la descripción y el precio de cada producto.",
        "Para comprar, solicítalo directamente en el local durante tu próxima visita.",
        "También puedes pedirlo por WhatsApp con el nombre exacto del producto.",
        "Los productos recomendados cambian según la temporada y el stock disponible.",
      ],
      tips: [
        "Pregunta a tu especialista qué productos se usaron en tu servicio para replicar el resultado.",
        "Los combos de producto + servicio suelen tener precio preferencial.",
      ],
      cta: "Reservar y comprar",
      href: "/cliente/reservar",
    },
  ],
};

// ─── Alerts ──────────────────────────────────────────────────────────────────

const alerts: Record<UserRole, { label: string; tone: string; href: string; detail: string }[]> = {
  admin: [
    { label: "2 citas próximas", tone: "bg-cyan-50 text-cyan-700", href: "/admin/agenda", detail: "Revisar agenda y aprobaciones" },
    { label: "1 insumo bajo mínimo", tone: "bg-amber-50 text-amber-700", href: "/admin/inventario", detail: "Revisar stock y reposición" },
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

// ─── SpiralCanvas ────────────────────────────────────────────────────────────

function SpiralCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const fit = () => {
      const rect = cv.parentElement!.getBoundingClientRect();
      W = rect.width; H = rect.height;
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = `${W}px`; cv.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(cv.parentElement!);

    const defs = [
      { fx: 0.10, fy: 0.20, fr: 0.30, turns: 4.5, spd:  0.00016, col: "109,40,217", a: 0.07 },
      { fx: 0.90, fy: 0.78, fr: 0.32, turns: 5.0, spd: -0.00013, col: "109,40,217", a: 0.06 },
      { fx: 0.52, fy: 0.06, fr: 0.24, turns: 3.5, spd:  0.00020, col: "34,211,238", a: 0.05 },
      { fx: 0.18, fy: 0.88, fr: 0.28, turns: 4.0, spd: -0.00015, col: "109,40,217", a: 0.055 },
      { fx: 0.84, fy: 0.14, fr: 0.26, turns: 3.5, spd:  0.00018, col: "34,211,238", a: 0.042 },
      { fx: 0.50, fy: 0.52, fr: 0.20, turns: 3.0, spd: -0.00010, col: "109,40,217", a: 0.035 },
    ];
    const rots = defs.map(() => Math.random() * Math.PI * 2);
    const STEPS = 260;
    let raf = 0;

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      const min = Math.min(W, H);
      for (let s = 0; s < defs.length; s++) {
        const d = defs[s];
        rots[s] += d.spd;
        const cx = d.fx * W, cy = d.fy * H, maxR = d.fr * min;
        ctx.beginPath();
        for (let i = 0; i <= STEPS; i++) {
          const t = i / STEPS;
          const angle = t * d.turns * Math.PI * 2 + rots[s];
          const r = t * maxR;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${d.col},${d.a})`;
        ctx.lineWidth = 1.3;
        ctx.lineCap = "round";
        ctx.stroke();
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}

// ─── NeuralCanvas ─────────────────────────────────────────────────────────────

type Particle = { x: number; y: number; vx: number; vy: number; baseR: number; pulse: number };
type Pulse = { a: number; b: number; t: number; dur: number };

function NeuralCanvas({
  className,
  density = 70,
  speed = 0.16,
  nodeColor = "216, 180, 254",
  lineColor = "167, 139, 250",
  glowColor = "192, 132, 252",
}: {
  className?: string;
  density?: number;
  speed?: number;
  nodeColor?: string;
  lineColor?: string;
  glowColor?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const fit = () => {
      const rect = cv.parentElement!.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      cv.width = W * dpr;
      cv.height = H * dpr;
      cv.style.width = `${W}px`;
      cv.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();

    const ro = new ResizeObserver(fit);
    ro.observe(cv.parentElement!);

    const particles: Particle[] = Array.from({ length: density }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      baseR: 1.2 + Math.random() * 1.6,
      pulse: Math.random() * Math.PI * 2,
    }));

    const pulses: Pulse[] = [];
    const MAX_DIST = 150;

    const spawnPulse = () => {
      const a = Math.floor(Math.random() * particles.length);
      const candidates: number[] = [];
      for (let i = 0; i < particles.length; i++) {
        if (i === a) continue;
        const dx = particles[a].x - particles[i].x;
        const dy = particles[a].y - particles[i].y;
        if (dx * dx + dy * dy < MAX_DIST * MAX_DIST) candidates.push(i);
      }
      if (!candidates.length) return;
      const b = candidates[Math.floor(Math.random() * candidates.length)];
      pulses.push({ a, b, t: 0, dur: 1200 + Math.random() * 1600 });
    };

    let last = performance.now();
    let pulseTimer = 0;
    let raf = 0;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      pulseTimer += dt;
      if (pulseTimer > 300) { spawnPulse(); pulseTimer = 0; }

      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.012;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }

      ctx.lineCap = "round";
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 > MAX_DIST * MAX_DIST) continue;
          const alpha = (1 - Math.sqrt(d2) / MAX_DIST) * 0.3;
          ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }

      for (let k = pulses.length - 1; k >= 0; k--) {
        const pl = pulses[k];
        pl.t += dt;
        const prog = pl.t / pl.dur;
        if (prog >= 1) { pulses.splice(k, 1); continue; }
        const A = particles[pl.a]; const B = particles[pl.b];
        const x = A.x + (B.x - A.x) * prog;
        const y = A.y + (B.y - A.y) * prog;
        const fade = Math.sin(prog * Math.PI);
        ctx.strokeStyle = `rgba(${nodeColor}, ${0.5 * fade})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
        ctx.fillStyle = `rgba(${nodeColor}, ${0.9 * fade})`;
        ctx.shadowColor = `rgba(${glowColor}, 0.9)`;
        ctx.shadowBlur = 14;
        ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      for (const p of particles) {
        const breath = 0.6 + Math.sin(p.pulse) * 0.25;
        ctx.fillStyle = `rgba(${nodeColor}, ${0.72 * breath})`;
        ctx.shadowColor = `rgba(${glowColor}, 0.85)`;
        ctx.shadowBlur = 9;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.baseR, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [density, speed, nodeColor, lineColor, glowColor]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}

// ─── BotIcon ──────────────────────────────────────────────────────────────────

function BotIcon() {
  return (
    <span className="relative flex h-9 w-8 items-end justify-center" aria-hidden="true">
      {/* antenna */}
      <span className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 rounded-full bg-violet-300" />
      <span className="absolute left-1/2 top-0 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400 shadow-[0_0_10px_3px_rgba(167,139,250,.85)]" />
      {/* head */}
      <span className="absolute left-0 top-2.5 h-[22px] w-8 rounded-xl border border-violet-300/60 bg-slate-950 shadow-[0_0_16px_rgba(124,58,237,.55)]">
        <span className="absolute left-1.5 top-[7px] size-1 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,.95)]" />
        <span className="absolute right-1.5 top-[7px] size-1 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,.95)]" />
        <span className="absolute bottom-1 left-1/2 h-px w-3 -translate-x-1/2 rounded-full bg-cyan-300/70" />
      </span>
      {/* body */}
      <span className="absolute bottom-0 left-1/2 h-3.5 w-5 -translate-x-1/2 rounded-b-lg rounded-t-sm border border-violet-300/40 bg-violet-950/80" />
    </span>
  );
}

// ─── LogoMark ─────────────────────────────────────────────────────────────────

function LogoMark() {
  return (
    <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/50 bg-slate-950 text-white shadow-xl shadow-violet-950/25">
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,.9),transparent_1.2rem),radial-gradient(circle_at_78%_82%,rgba(168,85,247,.85),transparent_1.4rem)]" />
      <span className="relative text-[11px] font-black tracking-[0.24em]">BL</span>
      <span className="absolute bottom-2 left-1/2 h-px w-6 -translate-x-1/2 bg-cyan-200" />
    </div>
  );
}

// ─── AppChrome ───────────────────────────────────────────────────────────────

export function AppChrome({
  role, title, nav, mode, children,
}: {
  role: UserRole; title: string; nav: NavItem[]; mode: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [botOpen, setBotOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alertsHidden, setAlertsHidden] = useState(false);
  const [topicIndex, setTopicIndex] = useState(0);

  // Bot corner roam: "right" | "left", fades out then teleports
  const [botSide, setBotSide] = useState<"right" | "left">("right");
  const [botVisible, setBotVisible] = useState(true);

  const topics = helpTopics[role];
  const topic = topics[topicIndex] ?? topics[0];
  const profileAlerts = useMemo(() => alerts[role], [role]);

  useEffect(() => {
    if (botOpen) return;
    const id = window.setInterval(() => {
      setBotVisible(false);
      window.setTimeout(() => {
        setBotSide((s) => (s === "right" ? "left" : "right"));
        setBotVisible(true);
      }, 600);
    }, 8000);
    return () => window.clearInterval(id);
  }, [botOpen]);

  const botPosClass = botSide === "right" ? "right-4" : "left-4";
  const panelPosClass = botSide === "right" ? "right-4" : "left-4";

  return (
    <div className="crm-shell min-h-dvh overflow-x-hidden text-slate-950">

      {/* ── Background ──────────────────────────────────────────── */}
      <div className="fixed inset-0 -z-10">
        {/* base lavanda muy suave */}
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#fbfaff_0%,#f5f1ff_38%,#eef6ff_72%,#fafffd_100%)]" />
        {/* halos corp difusos */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_45%_at_8%_2%,rgba(124,58,237,.07),transparent),radial-gradient(ellipse_50%_40%_at_92%_5%,rgba(34,211,238,.055),transparent),radial-gradient(ellipse_55%_45%_at_50%_98%,rgba(109,40,217,.055),transparent)]" />
        {/* espirales Archimedeas girando lentamente */}
        <SpiralCanvas className="absolute inset-0 h-full w-full" />
        {/* puntos neurales + líneas encima */}
        <NeuralCanvas
          className="absolute inset-0 h-full w-full"
          density={130}
          speed={0.13}
          nodeColor="167,139,250"
          lineColor="139,92,246"
          glowColor="124,58,237"
        />
      </div>

      {/* ── Mobile overlay ──────────────────────────────────────── */}
      {mobileOpen && (
        <button className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden" onClick={() => setMobileOpen(false)} type="button" aria-label="Cerrar menú" />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/40 bg-white/30 shadow-2xl shadow-violet-950/10 backdrop-blur-[28px] transition-all duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${open ? "w-[19rem] lg:w-[19rem]" : "w-[19rem] lg:w-[5.4rem]"}`}>
        {/* header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/30 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <LogoMark />
            <div className={open ? "block" : "hidden"}>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-violet-700">BarberLab</p>
              <h1 className="truncate text-sm font-black">{title}</h1>
            </div>
          </div>
          <button className="hidden rounded-xl border border-white/50 bg-white/50 p-2 text-slate-600 hover:bg-white/70 hover:text-violet-700 backdrop-blur-sm lg:grid" onClick={() => setOpen((v) => !v)} type="button" aria-label="Contraer menú">
            {open ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
          <button className="rounded-xl border border-white/50 bg-white/50 p-2 text-slate-600 lg:hidden" onClick={() => setMobileOpen(false)} type="button" aria-label="Cerrar menú">
            <X className="size-4" />
          </button>
        </div>

        {/* nav body */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className={`mb-4 flex flex-wrap gap-2 ${open ? "justify-start" : "justify-center"}`}>
            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${mode === "DEMO" ? "bg-violet-100 text-violet-700" : "bg-emerald-100 text-emerald-700"}`}>
              {open ? mode : mode.slice(0, 1)}
            </span>
            {open && <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">{role}</span>}
          </div>

          {open && (
            <label className="mb-3 flex items-center gap-2 rounded-2xl border border-white/40 bg-white/40 px-3 py-2.5 text-sm font-semibold text-slate-500 backdrop-blur-sm focus-within:border-violet-300 focus-within:bg-white/60">
              <Search className="size-4 shrink-0" />
              <input className="w-full bg-transparent outline-none placeholder:text-slate-400" placeholder="Buscar módulo" />
            </label>
          )}

          <nav className="grid gap-1">
            {nav.map((item) => {
              const style = navStyles[item.label] ?? navStyles.Dashboard;
              const Icon = style.icon;
              return (
                <Link
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white/50 hover:text-violet-800 ${open ? "justify-start" : "justify-center"}`}
                  href={item.href}
                  key={item.href}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className={`grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br shadow-md shadow-black/10 transition group-hover:scale-105 group-hover:shadow-lg ${style.tone}`}>
                    <Icon className="size-5" />
                  </span>
                  {open && <span className="truncate font-semibold tracking-[-0.01em]">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* alerts panel in sidebar */}
          {open && !alertsHidden && (
            <section className="mt-5 rounded-3xl border border-violet-100 bg-white/80 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-600">Alarmas</p>
                <button className="rounded-lg p-1 text-slate-400 hover:text-violet-600" onClick={() => setAlertsHidden(true)} type="button" aria-label="Ocultar alarmas">
                  <X className="size-3.5" />
                </button>
              </div>
              <div className="mt-3 grid gap-2">
                {profileAlerts.map((item) => (
                  <Link className={`flex items-start gap-2 rounded-xl px-3 py-2 text-xs font-bold ${item.tone} transition hover:opacity-80`} href={item.href} key={item.label}>
                    <span className="mt-px shrink-0 size-1.5 rounded-full bg-current opacity-60 mt-1" />
                    <span>
                      <span className="block">{item.label}</span>
                      <span className="block font-medium opacity-70">{item.detail}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
          {open && alertsHidden && (
            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-200 px-3 py-3 text-xs font-bold text-violet-600 hover:bg-violet-50" onClick={() => setAlertsHidden(false)} type="button">
              <Bell className="size-4" /> Mostrar alarmas
            </button>
          )}
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────── */}
      <div className={`min-h-dvh pb-14 transition-[padding] duration-300 ${open ? "lg:pl-[19rem]" : "lg:pl-[5.2rem]"}`}>
        {/* topbar */}
        <header className="sticky top-0 z-20 border-b border-white/30 bg-white/25 px-4 py-3 backdrop-blur-[28px]">
          <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 lg:hidden" onClick={() => setMobileOpen(true)} type="button" aria-label="Abrir menú">
                <Menu className="size-4" />
              </button>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-violet-600">MRZLABS / CRM</p>
                <h2 className="text-xl font-black tracking-tight sm:text-2xl">{title}</h2>
              </div>
            </div>
            <div className="relative hidden items-center gap-2 md:flex">
              <button className="relative grid size-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-violet-200 hover:text-violet-700" onClick={() => setAlertsOpen((v) => !v)} type="button" aria-label="Ver alarmas">
                <Bell className="size-4.5" />
                {!alertsHidden && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,.9)]" />}
              </button>
              <button className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white hover:bg-violet-950 transition" onClick={() => setBotOpen(true)} type="button">
                Ayuda
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
                    {(!alertsHidden ? profileAlerts : []).map((item) => (
                      <Link className={`block rounded-xl px-3 py-3 text-xs font-bold ${item.tone} transition hover:opacity-80`} href={item.href} key={item.label} onClick={() => setAlertsOpen(false)}>
                        <span className="block">{item.label}</span>
                        <span className="mt-0.5 block font-medium opacity-75">{item.detail}</span>
                      </Link>
                    ))}
                    {alertsHidden && <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs font-bold text-slate-400">Alarmas ocultas</p>}
                  </div>
                </div>
              )}
            </div>
            <button className="grid size-10 place-items-center rounded-2xl bg-slate-950 text-white md:hidden" onClick={() => setBotOpen(true)} type="button" aria-label="Abrir ayuda">
              <CircleHelp className="size-4.5" />
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6">{children}</main>
      </div>

      {/* ── About MRZLABS panel ─────────────────────────────────── */}
      {aboutOpen && (
        <div className={`fixed bottom-16 z-40 w-[min(92vw,360px)] rounded-3xl border border-violet-200 bg-white/97 p-5 shadow-2xl shadow-violet-950/16 backdrop-blur-2xl ${panelPosClass}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">MRZLABS</p>
              <h3 className="mt-1 text-lg font-black">CRM adaptable para negocios reales</h3>
            </div>
            <button className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-slate-700" onClick={() => setAboutOpen(false)} type="button" aria-label="Cerrar">
              <X className="size-4" />
            </button>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Diseñamos sistemas con agenda, caja, inventario, reportes y roles para que el comercio pueda operar, medir y vender mejor sin depender de procesos manuales.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {["Agenda inteligente", "Caja y turnos", "Control de stock", "Reportes en tiempo real"].map((f) => (
              <span key={f} className="rounded-xl bg-violet-50 px-3 py-2 text-[11px] font-black text-violet-700">{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Bot help panel ──────────────────────────────────────── */}
      {botOpen && (
        <div className={`fixed bottom-16 z-40 max-h-[78dvh] w-[min(95vw,480px)] overflow-y-auto rounded-[2rem] border border-violet-200 bg-white/97 shadow-2xl shadow-slate-950/18 backdrop-blur-2xl ${panelPosClass}`}>
          {/* panel header */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-[2rem] border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-2xl bg-slate-950">
                <Sparkles className="size-4 text-cyan-300" />
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-600">Bot MRZLABS</p>
                <h3 className="text-base font-black">Guía BarberLab</h3>
              </div>
            </div>
            <button className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:text-slate-700" onClick={() => setBotOpen(false)} type="button" aria-label="Cerrar">
              <X className="size-4" />
            </button>
          </div>

          <div className="p-5">
            {/* topic tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {topics.map((item, i) => (
                <button
                  className={`shrink-0 rounded-2xl px-4 py-2.5 text-xs font-black transition ${i === topicIndex ? "bg-violet-700 text-white shadow-lg shadow-violet-700/30" : "border border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:text-violet-700"}`}
                  key={item.title}
                  onClick={() => setTopicIndex(i)}
                  type="button"
                >
                  {item.title}
                </button>
              ))}
            </div>

            {/* active topic */}
            <div className="mt-4 rounded-3xl bg-slate-950 p-5 text-white">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-cyan-300" />
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">Módulo activo</p>
              </div>
              <h4 className="mt-2.5 text-xl font-black">{topic.title}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-300">{topic.body}</p>
            </div>

            {/* steps */}
            <div className="mt-4">
              <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Paso a paso</p>
              <div className="grid gap-2">
                {topic.steps.map((step, i) => (
                  <div className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-sm text-slate-700" key={step}>
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-violet-100 text-[11px] font-black text-violet-700">{i + 1}</span>
                    <span className="leading-5">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* tips */}
            {topic.tips && topic.tips.length > 0 && (
              <div className="mt-4">
                <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">Tips pro</p>
                <div className="grid gap-2">
                  {topic.tips.map((tip) => (
                    <div className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-3.5 text-sm text-amber-800" key={tip}>
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
                      <span className="leading-5">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            {topic.href && topic.cta && (
              <Link className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-violet-950 transition" href={topic.href}>
                {topic.cta} <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Signature bar ───────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 h-14 overflow-hidden border-t border-violet-400/15 bg-slate-950/94">
        <NeuralCanvas
          className="absolute inset-0 h-full w-full"
          density={40}
          speed={0.22}
          nodeColor="216,180,254"
          lineColor="167,139,250"
          glowColor="192,132,252"
        />
        <div className="relative flex h-full items-center justify-between px-4 sm:px-6">
          {/* copyright izquierda */}
          <span className="text-[10px] font-semibold tracking-wide text-violet-400/50">
            © {new Date().getFullYear()} MRZLABS · Todos los derechos reservados
          </span>
          {/* centro — solo sm+ */}
          <span className="absolute left-1/2 -translate-x-1/2 hidden sm:block text-[10px] font-bold uppercase tracking-[0.18em] text-violet-400/40">
            BarberLab CRM
          </span>
          {/* built by botón derecha */}
          <button
            className="rounded-full border border-violet-400/25 bg-violet-950/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300/80 transition hover:bg-violet-900/70"
            onClick={() => setAboutOpen((v) => !v)}
            type="button"
          >
            Built by MRZLABS
          </button>
        </div>
      </div>

      {/* ── Bot roaming button ──────────────────────────────────── */}
      <div
        className={`fixed bottom-16 z-40 flex flex-col items-center gap-2 transition-all duration-500 ${botPosClass} ${botVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
        style={{ bottom: "3.75rem" }}
      >
        <button
          className="bot-pulse relative grid size-10 place-items-center rounded-full border border-violet-400/50 bg-slate-950 shadow-xl shadow-violet-950/50 hover:scale-110 transition-transform"
          onClick={() => setBotOpen((v) => !v)}
          type="button"
          aria-label="Abrir ayuda BarberLab"
        >
          <BotIcon />
          <span className="absolute inset-0 rounded-full border border-violet-400/30 animate-[ping_2.4s_ease-out_infinite]" />
        </button>
      </div>
    </div>
  );
}
