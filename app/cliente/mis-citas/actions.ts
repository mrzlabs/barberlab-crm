"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { citas } from "@/lib/db/schema";
import { citaPerteneceCliente, slotDisponible } from "@/lib/cliente/queries";
import { citaIdSchema, reprogramarSchema } from "@/lib/validations/cliente";

export async function cancelarCita(formData: FormData) {
  const profile = await requireRole(["cliente"]);
  const payload = citaIdSchema.parse(Object.fromEntries(formData));
  const cita = await citaPerteneceCliente(profile.id, payload.citaId);

  if (!cita || cita.estado === "realizada") {
    throw new Error("La cita no se puede cancelar");
  }

  await getDb().update(citas).set({ estado: "cancelada", updatedAt: new Date() }).where(eq(citas.id, payload.citaId));

  revalidatePath("/cliente/mis-citas");
  revalidatePath("/admin/agenda");
}

export async function reprogramarCita(formData: FormData) {
  const profile = await requireRole(["cliente"]);
  const payload = reprogramarSchema.parse(Object.fromEntries(formData));
  const cita = await citaPerteneceCliente(profile.id, payload.citaId);

  if (!cita || cita.estado === "realizada") {
    throw new Error("La cita no se puede reprogramar");
  }

  const inicio = new Date(payload.inicio);
  const fin = new Date(payload.fin);
  const fecha = payload.inicio.slice(0, 10);
  const disponible = await slotDisponible({
    empleadoId: payload.empleadoId,
    servicioId: payload.servicioId,
    fecha,
    inicio,
    fin,
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
      updatedAt: new Date(),
    })
    .where(eq(citas.id, payload.citaId));

  revalidatePath("/cliente/mis-citas");
  revalidatePath("/cliente/reservar");
  revalidatePath("/admin/agenda");
}
