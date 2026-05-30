import {
  BarChart3,
  Boxes,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  LayoutDashboard,
  Scissors,
  Settings,
  Users,
} from "lucide-react";

export type NavStyle = {
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  shape: "circle" | "squircle" | "square";
};

export const navStyles: Record<string, NavStyle> = {
  Dashboard:      { icon: LayoutDashboard, tone: "bg-indigo-600 text-white shadow-indigo-500/40",                        shape: "squircle" },
  Agenda:         { icon: CalendarDays,    tone: "bg-emerald-500 text-white shadow-emerald-400/40",                      shape: "circle"   },
  Turnos:         { icon: ClipboardCheck,  tone: "bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-orange-400/40", shape: "squircle" },
  Gastos:         { icon: CreditCard,      tone: "bg-rose-500 text-white shadow-rose-400/40",                            shape: "square"   },
  Inventario:     { icon: Boxes,           tone: "bg-lime-500 text-slate-900 shadow-lime-400/40",                        shape: "squircle" },
  Servicios:      { icon: Scissors,        tone: "bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-violet-500/40", shape: "circle"  },
  Empleados:      { icon: Users,           tone: "bg-sky-500 text-white shadow-sky-400/40",                              shape: "circle"   },
  Clientes:       { icon: Users,           tone: "bg-teal-500 text-white shadow-teal-400/40",                            shape: "circle"   },
  Reportes:       { icon: BarChart3,       tone: "bg-gradient-to-br from-slate-700 to-violet-700 text-white shadow-violet-700/40", shape: "squircle" },
  Configuracion:  { icon: Settings,        tone: "bg-gradient-to-br from-cyan-600 to-teal-500 text-white shadow-cyan-500/40", shape: "squircle" },
  "Mi agenda":    { icon: CalendarDays,    tone: "bg-emerald-500 text-white shadow-emerald-400/40",                      shape: "circle"   },
  "Cerrar turno": { icon: ClipboardCheck,  tone: "bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-orange-400/40", shape: "squircle" },
  Reservar:       { icon: CalendarDays,    tone: "bg-cyan-500 text-white shadow-cyan-400/40",                            shape: "circle"   },
  "Mis citas":    { icon: ClipboardCheck,  tone: "bg-violet-600 text-white shadow-violet-500/40",                        shape: "squircle" },
};
