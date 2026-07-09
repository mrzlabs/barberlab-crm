"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { addCitaHistory } from "@/lib/citas/history";
import { logActivity } from "@/lib/activity/log";
import { getDb } from "@/lib/db";
import { citas, depositos, negocios, turnos } from "@/lib/db/schema";
import { getPuntosConfig, moverPuntos, puntosPorConsumo } from "@/lib/puntos";
import { turnoSchema } from "@/lib/validations/admin";
import { and, eq } from "drizzle-orm";

export async function closeTurno(formData: FormData) {
  const profile = await requireRole(["admin", "super_admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  const payload = turnoSchema.parse(Object.fromEntries(formData));
  const db = getDb();

  const [current] = await db
    .select({ estado: citas.estado, clienteId: citas.clienteId })
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

  // Fidelización: acreditar puntos por el consumo si el negocio lo tiene habilitado
  if (current.clienteId) {
    const [negocio] = await db
      .select({ settings: negocios.settings })
      .from(negocios)
      .where(eq(negocios.id, negocioId))
      .limit(1);
    const config = getPuntosConfig(negocio?.settings);
    const ganados = puntosPorConsumo(config, payload.precioFinal);
    if (ganados > 0) {
      await moverPuntos({
        negocioId,
        clienteId: current.clienteId,
        delta: ganados,
        motivo: `Consumo turno · ${payload.metodoPago}`,
        citaId: payload.citaId,
      });
    }
  }

  revalidatePath("/admin/turnos");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/inventario");
  redirect("/admin/turnos?ok=Turno+cerrado+correctamente");
}
