"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { addCitaHistory } from "@/lib/citas/history";
import { logActivity } from "@/lib/activity/log";
import { getDb } from "@/lib/db";
import { citas, depositos, turnos } from "@/lib/db/schema";
import { turnoSchema } from "@/lib/validations/admin";
import { and, eq } from "drizzle-orm";

export async function closeTurno(formData: FormData) {
  const profile = await requireRole(["admin", "super_admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  const payload = turnoSchema.parse(Object.fromEntries(formData));
  const db = getDb();

  const [current] = await db
    .select({ estado: citas.estado })
    .from(citas)
    .where(and(eq(citas.id, payload.citaId), eq(citas.negocioId, negocioId)))
    .limit(1);

  if (!current) throw new Error("Cita no encontrada o no pertenece a este negocio");

  await db.insert(turnos).values({
    negocioId,
    citaId: payload.citaId,
    precioFinal: String(payload.precioFinal),
    propina: String(payload.propina),
    metodoPago: payload.metodoPago,
    descuento: String(payload.descuento),
    observaciones: payload.observaciones || null,
  });

  // Marcar depósitos recibidos de esta cita como aplicados
  await db
    .update(depositos)
    .set({ estado: "aplicado", updatedAt: new Date().toISOString() })
    .where(and(eq(depositos.citaId, payload.citaId), eq(depositos.negocioId, negocioId), eq(depositos.estado, "recibido")));

  // Actualizar estado de la cita a "realizada"
  await db
    .update(citas)
    .set({ estado: "realizada", updatedAt: new Date().toISOString() })
    .where(and(eq(citas.id, payload.citaId), eq(citas.negocioId, negocioId)));

  await addCitaHistory({
    citaId: payload.citaId,
    actorId: profile.id,
    actorRol: "admin",
    estadoAnterior: current?.estado,
    estadoNuevo: "realizada",
    accion: "turno_cerrado",
    detalle: "Admin cerro turno y registro caja",
  });

  await logActivity({ usuarioId: profile.id, negocioId, accion: "turno_cerrado", detalle: { citaId: payload.citaId, metodoPago: payload.metodoPago } });

  revalidatePath("/admin/turnos");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/inventario");
  redirect("/admin/turnos?ok=Turno+cerrado+correctamente");
}
