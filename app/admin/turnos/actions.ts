"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { addCitaHistory } from "@/lib/citas/history";
import { getDb } from "@/lib/db";
import { citas, turnos } from "@/lib/db/schema";
import { turnoSchema } from "@/lib/validations/admin";
import { and, eq } from "drizzle-orm";

export async function closeTurno(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  const payload = turnoSchema.parse(Object.fromEntries(formData));
  const [current] = await getDb()
    .select({ estado: citas.estado })
    .from(citas)
    .where(and(eq(citas.id, payload.citaId), eq(citas.negocioId, negocioId)))
    .limit(1);

  if (!current) throw new Error("Cita no encontrada o no pertenece a este negocio");

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
    actorRol: "admin",
    estadoAnterior: current?.estado,
    estadoNuevo: "realizada",
    accion: "turno_cerrado",
    detalle: "Admin cerro turno y registro caja",
  });

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/inventario");
  redirect("/admin/turnos?ok=Turno+cerrado+correctamente");
}
