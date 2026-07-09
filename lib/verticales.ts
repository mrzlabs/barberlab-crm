import type { NegocioSettings, NegocioVertical } from "@/lib/db/schema";

/* ============================================================
   Verticales de negocio — el mismo CRM se adapta a otros tipos
   de negocio (p. ej. restaurantes) cambiando vocabulario y foco.
   El vertical se guarda en negocios.settings.vertical.
   ============================================================ */

export interface VerticalDef {
  id: NegocioVertical;
  label: string;
  descripcion: string;
  vocab: {
    servicio: string;
    servicios: string;
    cita: string;
    citas: string;
    empleado: string;
    empleados: string;
    cliente: string;
    clientes: string;
  };
}

export const VERTICALES: VerticalDef[] = [
  {
    id: "barberia",
    label: "Barbería",
    descripcion: "Cortes, barba y estilo. Agenda por barbero y comisiones.",
    vocab: { servicio: "Servicio", servicios: "Servicios", cita: "Cita", citas: "Citas", empleado: "Barbero", empleados: "Barberos", cliente: "Cliente", clientes: "Clientes" },
  },
  {
    id: "peluqueria",
    label: "Peluquería / Salón",
    descripcion: "Belleza y color. Agenda por estilista.",
    vocab: { servicio: "Servicio", servicios: "Servicios", cita: "Cita", citas: "Citas", empleado: "Estilista", empleados: "Estilistas", cliente: "Cliente", clientes: "Clientes" },
  },
  {
    id: "spa_unas",
    label: "Spa de uñas",
    descripcion: "Manicure, pedicure y nail art.",
    vocab: { servicio: "Servicio", servicios: "Servicios", cita: "Cita", citas: "Citas", empleado: "Manicurista", empleados: "Manicuristas", cliente: "Cliente", clientes: "Clientes" },
  },
  {
    id: "tatuajes",
    label: "Estudio de tatuajes",
    descripcion: "Sesiones, diseños y artistas.",
    vocab: { servicio: "Diseño", servicios: "Diseños", cita: "Sesión", citas: "Sesiones", empleado: "Artista", empleados: "Artistas", cliente: "Cliente", clientes: "Clientes" },
  },
  {
    id: "restaurante",
    label: "Restaurante / Bar",
    descripcion: "Reservas de mesa, menú y personal de sala.",
    vocab: { servicio: "Plato", servicios: "Menú", cita: "Reserva", citas: "Reservas", empleado: "Mesero", empleados: "Personal", cliente: "Comensal", clientes: "Comensales" },
  },
  {
    id: "otro",
    label: "Otro negocio de servicios",
    descripcion: "Cualquier negocio que agende y atienda clientes.",
    vocab: { servicio: "Servicio", servicios: "Servicios", cita: "Cita", citas: "Citas", empleado: "Empleado", empleados: "Equipo", cliente: "Cliente", clientes: "Clientes" },
  },
];

export function getVertical(settings: NegocioSettings | null | undefined): VerticalDef {
  const id = settings?.vertical ?? "barberia";
  return VERTICALES.find(v => v.id === id) ?? VERTICALES[0];
}
