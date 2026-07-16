"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { getEmpleadoByUsr } from "@/lib/empleado/queries";
import { isDemoMode } from "@/lib/demo-server";
import { getDb } from "@/lib/db";
import { citas } from "@/lib/db/schema";
import { addCitaHistory } from "@/lib/citas/history";
import { estadoCitaSchema } from "@/lib/validations/admin";

export async function updateMiCita(formData: FormData) {
  const profile = await requireRole(["empleado"]);
  if (await isDemoMode()) {
    revalidatePath("/empleado/mi-agenda");
    return;
  }

  const payload = estadoCitaSchema.parse(Object.fromEntries(formData));
  const empleado = await getEmpleadoByUsr(profile.id);
  if (!empleado) {
    throw new Error("Empleado sin perfil operativo");
  }

  const [current] = await getDb()
    .select({ estado: citas.estado })
    .from(citas)
    .where(and(eq(citas.id, payload.citaId), eq(citas.empleadoId, empleado.id)))
    .limit(1);

  await getDb().update(citas).set({
    estado: payload.estado,
    updatedAt: new Date().toISOString(),
  }).where(and(eq(citas.id, payload.citaId), eq(citas.empleadoId, empleado.id)));

  await addCitaHistory({
    citaId: payload.citaId,
    actorId: profile.id,
    actorRol: "empleado",
    estadoAnterior: current?.estado,
    estadoNuevo: payload.estado,
    accion: "estado_cita_empleado",
    detalle: `Empleado cambio cita a ${payload.estado}`,
  });

  revalidatePath("/empleado/mi-agenda");
  revalidatePath("/empleado/cerrar-turno");
  revalidatePath("/admin/agenda");
}
