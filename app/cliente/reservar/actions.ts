"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { citas } from "@/lib/db/schema";
import { addCitaHistory } from "@/lib/citas/history";
import { ensureCliente, slotDisponible } from "@/lib/cliente/queries";
import { reservarSchema } from "@/lib/validations/cliente";

export async function reservarCita(formData: FormData) {
  const profile = await requireRole(["cliente"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  const payload = reservarSchema.parse(Object.fromEntries(formData));

  if (isDemoMode()) {
    revalidatePath("/cliente/reservar");
    revalidatePath("/cliente/mis-citas");
    return;
  }

  const inicioDate = new Date(payload.inicio);
  const finDate = new Date(payload.fin);
  const inicio = inicioDate.toISOString();
  const fin = finDate.toISOString();
  const fecha = payload.inicio.slice(0, 10);
  const cliente = await ensureCliente(profile, negocioId);
  const disponible = await slotDisponible({
    empleadoId: payload.empleadoId,
    servicioId: payload.servicioId,
    fecha,
    inicio: inicioDate,
    fin: finDate,
  });

  if (!disponible) {
    throw new Error("El horario seleccionado ya no esta disponible");
  }

  const [created] = await getDb().insert(citas).values({
    negocioId,
    clienteId: cliente.id,
    empleadoId: payload.empleadoId,
    servicioId: payload.servicioId,
    inicio,
    fin,
    estado: "reservada",
  }).returning({ id: citas.id });

  await addCitaHistory({
    citaId: created.id,
    actorId: profile.id,
    actorRol: "cliente",
    estadoNuevo: "reservada",
    accion: "cita_cliente_reservada",
    detalle: "Cliente separo una cita desde la agenda publica",
  });

  revalidatePath("/cliente/reservar");
  revalidatePath("/cliente/mis-citas");
  revalidatePath("/admin/agenda");
}
