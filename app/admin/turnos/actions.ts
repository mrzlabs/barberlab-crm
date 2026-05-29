"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { addCitaHistory } from "@/lib/citas/history";
import { getDb } from "@/lib/db";
import { citas, turnos } from "@/lib/db/schema";
import { turnoSchema } from "@/lib/validations/admin";
import { eq } from "drizzle-orm";

export async function closeTurno(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const payload = turnoSchema.parse(Object.fromEntries(formData));
  const [current] = await getDb().select({ estado: citas.estado }).from(citas).where(eq(citas.id, payload.citaId)).limit(1);

  await getDb().insert(turnos).values({
    negocioId: profile.negocioId,
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
    actorRol: "admin",
    estadoAnterior: current?.estado,
    estadoNuevo: "realizada",
    accion: "turno_cerrado",
    detalle: "Admin cerro turno y registro caja",
  });

  revalidatePath("/admin/turnos");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/inventario");
}
