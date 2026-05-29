"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { turnos } from "@/lib/db/schema";
import { turnoSchema } from "@/lib/validations/admin";

export async function closeTurno(formData: FormData) {
  await requireRole(["admin"]);
  const payload = turnoSchema.parse(Object.fromEntries(formData));

  await getDb().insert(turnos).values({
    citaId: payload.citaId,
    precioFinal: String(payload.precioFinal),
    propina: String(payload.propina),
    metodoPago: payload.metodoPago,
    descuento: String(payload.descuento),
    observaciones: payload.observaciones || null,
  });

  revalidatePath("/admin/turnos");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/inventario");
}
