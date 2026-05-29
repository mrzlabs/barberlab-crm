"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { getEmpleadoByUsr } from "@/lib/empleado/queries";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { citas } from "@/lib/db/schema";
import { estadoCitaSchema } from "@/lib/validations/admin";

export async function updateMiCita(formData: FormData) {
  const profile = await requireRole(["empleado"]);
  if (isDemoMode()) {
    revalidatePath("/empleado/mi-agenda");
    return;
  }

  const payload = estadoCitaSchema.parse(Object.fromEntries(formData));
  const empleado = await getEmpleadoByUsr(profile.id);
  if (!empleado) {
    throw new Error("Empleado sin perfil operativo");
  }

  await getDb().update(citas).set({
    estado: payload.estado,
    updatedAt: new Date(),
  }).where(and(eq(citas.id, payload.citaId), eq(citas.empleadoId, empleado.id)));

  revalidatePath("/empleado/mi-agenda");
  revalidatePath("/empleado/cerrar-turno");
  revalidatePath("/admin/agenda");
}
