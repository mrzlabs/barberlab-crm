"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { citas } from "@/lib/db/schema";
import { addCitaHistory } from "@/lib/citas/history";
import { citaPerteneceCliente, slotDisponible } from "@/lib/cliente/queries";
import { citaIdSchema, comentarioCitaSchema, reprogramarSchema } from "@/lib/validations/cliente";

export async function cancelarCita(formData: FormData) {
  const profile = await requireRole(["cliente"]);
  const payload = citaIdSchema.parse(Object.fromEntries(formData));
  const cita = await citaPerteneceCliente(profile.id, payload.citaId);

  if (!cita || cita.estado === "realizada") {
    throw new Error("La cita no se puede cancelar");
  }

  if (isDemoMode()) {
    revalidatePath("/cliente/mis-citas");
    return;
  }

  await getDb().update(citas).set({ estado: "cancelada", updatedAt: new Date().toISOString() }).where(eq(citas.id, payload.citaId));
  await addCitaHistory({
    citaId: payload.citaId,
    actorId: profile.id,
    actorRol: "cliente",
    estadoAnterior: cita.estado,
    estadoNuevo: "cancelada",
    accion: "cita_cliente_cancelada",
    detalle: "Cliente cancelo la cita",
  });

  revalidatePath("/cliente/mis-citas");
  revalidatePath("/admin/agenda");
}

export async function confirmarCita(formData: FormData) {
  const profile = await requireRole(["cliente"]);
  const payload = citaIdSchema.parse(Object.fromEntries(formData));
  const cita = await citaPerteneceCliente(profile.id, payload.citaId);
  if (!cita || cita.estado !== "reservada") throw new Error("La cita no se puede confirmar");
  if (isDemoMode()) {
    revalidatePath("/cliente/mis-citas");
    return;
  }
  await getDb().update(citas).set({ estado: "confirmada", updatedAt: new Date().toISOString() }).where(eq(citas.id, payload.citaId));
  await addCitaHistory({
    citaId: payload.citaId,
    actorId: profile.id,
    actorRol: "cliente",
    estadoAnterior: "reservada",
    estadoNuevo: "confirmada",
    accion: "cita_cliente_confirmada",
    detalle: "Cliente confirmó la cita",
  });
  revalidatePath("/cliente/mis-citas");
  revalidatePath("/admin/agenda");
}

export async function saveComentarioCita(formData: FormData) {
  const profile = await requireRole(["cliente"]);
  const payload = comentarioCitaSchema.parse(Object.fromEntries(formData));
  const cita = await citaPerteneceCliente(profile.id, payload.citaId);
  if (!cita) throw new Error("Cita no encontrada");
  if (isDemoMode()) {
    revalidatePath("/cliente/mis-citas");
    return;
  }
  await addCitaHistory({
    citaId: payload.citaId,
    actorId: profile.id,
    actorRol: "cliente",
    accion: "comentario_cliente",
    detalle: JSON.stringify({ comentario: payload.comentario }),
  });
  revalidatePath("/cliente/mis-citas");
}

export async function reprogramarCita(formData: FormData) {
  const profile = await requireRole(["cliente"]);
  const payload = reprogramarSchema.parse(Object.fromEntries(formData));
  const cita = await citaPerteneceCliente(profile.id, payload.citaId);

  if (!cita || cita.estado === "realizada") {
    throw new Error("La cita no se puede reprogramar");
  }

  if (isDemoMode()) {
    revalidatePath("/cliente/mis-citas");
    return;
  }

  const inicioDate = new Date(payload.inicio);
  const finDate = new Date(payload.fin);
  const inicio = inicioDate.toISOString();
  const fin = finDate.toISOString();
  const fecha = payload.inicio.slice(0, 10);
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

  await getDb()
    .update(citas)
    .set({
      servicioId: payload.servicioId,
      empleadoId: payload.empleadoId,
      inicio,
      fin,
      estado: "reservada",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(citas.id, payload.citaId));

  await addCitaHistory({
    citaId: payload.citaId,
    actorId: profile.id,
    actorRol: "cliente",
    estadoAnterior: cita.estado,
    estadoNuevo: "reservada",
    accion: "cita_cliente_reprogramada",
    detalle: "Cliente reprogramo la cita y quedo pendiente de confirmacion",
  });

  revalidatePath("/cliente/mis-citas");
  revalidatePath("/cliente/reservar");
  revalidatePath("/admin/agenda");
}
