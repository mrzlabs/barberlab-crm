import { getDb } from "@/lib/db";
import { citaHistorial } from "@/lib/db/schema";
import type { UserRole } from "@/lib/auth/roles";

type EstadoCita = "reservada" | "confirmada" | "realizada" | "cancelada" | "no_asistio";

export async function addCitaHistory(params: {
  citaId: string;
  actorId?: string | null;
  actorRol?: UserRole | null;
  estadoAnterior?: EstadoCita | null;
  estadoNuevo?: EstadoCita | null;
  accion: string;
  detalle?: string | null;
}) {
  await getDb().insert(citaHistorial).values({
    citaId: params.citaId,
    actorId: params.actorId || null,
    actorRol: params.actorRol || null,
    estadoAnterior: params.estadoAnterior || null,
    estadoNuevo: params.estadoNuevo || null,
    accion: params.accion,
    detalle: params.detalle || null,
  });
}
