"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo";
import { addCitaHistory } from "@/lib/citas/history";
import { getDb } from "@/lib/db";
import { citas, turnos } from "@/lib/db/schema";
import { citaPerteneceEmpleado } from "@/lib/empleado/queries";
import { turnoSchema } from "@/lib/validations/admin";

export async function closeMiTurno(formData: FormData) {
  const profile = await requireRole(["empleado"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  const payload = turnoSchema.parse(Object.fromEntries(formData));
  const allowed = await citaPerteneceEmpleado(profile.id, payload.citaId);

  if (!allowed) {
    throw new Error("La cita no pertenece al empleado autenticado");
  }

  if (isDemoMode()) {
    revalidatePath("/empleado/cerrar-turno");
    revalidatePath("/empleado/mi-agenda");
    return;
  }

  const [current] = await getDb().select({ estado: citas.estado }).from(citas).where(eq(citas.id, payload.citaId)).limit(1);

  await getDb().insert(turnos).values({
    negocioId,
    citaId: payload.citaId,
    precioFinal: String(payload.precioFinal),
    propina: String(payload.propina),
    metodoPago: payload.metodoPago,
    descuento: String(payload.descuento),
    observaciones: payload.observaciones || null,
  });

  await addCitaHistory({
    citaId: payload.citaId,
    actorId: profile.id,
    actorRol: "empleado",
    estadoAnterior: current?.estado,
    estadoNuevo: "realizada",
    accion: "turno_empleado_cerrado",
    detalle: "Empleado cerro turno y registro caja",
  });

  revalidatePath("/empleado/cerrar-turno");
  revalidatePath("/empleado/mi-agenda");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/inventario");
}
