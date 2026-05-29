"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { turnos } from "@/lib/db/schema";
import { citaPerteneceEmpleado } from "@/lib/empleado/queries";
import { turnoSchema } from "@/lib/validations/admin";

export async function closeMiTurno(formData: FormData) {
  const profile = await requireRole(["empleado"]);
  const payload = turnoSchema.parse(Object.fromEntries(formData));
  const allowed = await citaPerteneceEmpleado(profile.id, payload.citaId);

  if (!allowed) {
    throw new Error("La cita no pertenece al empleado autenticado");
  }

  await getDb().insert(turnos).values({
    citaId: payload.citaId,
    precioFinal: String(payload.precioFinal),
    propina: String(payload.propina),
    metodoPago: payload.metodoPago,
    descuento: String(payload.descuento),
    observaciones: payload.observaciones || null,
  });

  revalidatePath("/empleado/cerrar-turno");
  revalidatePath("/empleado/mi-agenda");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/inventario");
}
