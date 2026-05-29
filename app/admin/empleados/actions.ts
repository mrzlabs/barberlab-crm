"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { empleados, usuarios } from "@/lib/db/schema";
import { empleadoAdminSchema } from "@/lib/validations/catalog";

export async function createEmpleado(formData: FormData) {
  await requireRole(["admin"]);
  if (isDemoMode()) {
    revalidatePath("/admin/empleados");
    return;
  }

  const payload = empleadoAdminSchema.parse({
    ...Object.fromEntries(formData),
    activo: formData.get("activo") === "on",
  });
  const userId = randomUUID();

  await getDb().transaction(async (tx) => {
    await tx.insert(usuarios).values({
      id: userId,
      email: payload.email.trim().toLowerCase(),
      rol: "empleado",
      nombre: payload.nombre.trim(),
      telefono: payload.telefono.trim(),
      activo: payload.activo,
    });

    await tx.insert(empleados).values({
      usuarioId: userId,
      especialidad: payload.especialidad,
      comisionPct: String(payload.comisionPct),
      activo: payload.activo,
    });
  });

  revalidatePath("/admin/empleados");
  revalidatePath("/cliente/reservar");
}
