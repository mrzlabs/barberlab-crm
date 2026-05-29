"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { slotDisponible } from "@/lib/cliente/queries";
import { addCitaHistory } from "@/lib/citas/history";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { bloqueosEmpleado, citas, horariosEmpleado } from "@/lib/db/schema";
import { bloqueoEmpleadoSchema, citaAdminSchema, estadoCitaSchema, horarioEmpleadoSchema } from "@/lib/validations/admin";

export async function createCitaAdmin(formData: FormData) {
  const profile = await requireRole(["admin"]);
  if (isDemoMode()) {
    revalidatePath("/admin/agenda");
    return;
  }

  const payload = citaAdminSchema.parse(Object.fromEntries(formData));
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
    throw new Error("El horario seleccionado no esta disponible");
  }

  const [created] = await getDb().insert(citas).values({
    negocioId: profile.negocioId,
    clienteId: payload.clienteId,
    empleadoId: payload.empleadoId,
    servicioId: payload.servicioId,
    inicio,
    fin,
    estado: payload.estado,
  }).returning({ id: citas.id });

  await addCitaHistory({
    citaId: created.id,
    actorId: profile.id,
    actorRol: "admin",
    estadoNuevo: payload.estado,
    accion: "cita_admin_creada",
    detalle: "Cita creada desde agenda admin",
  });

  revalidatePath("/admin/agenda");
  revalidatePath("/admin/turnos");
}

export async function createHorarioEmpleado(formData: FormData) {
  const profile = await requireRole(["admin"]);
  if (isDemoMode()) {
    revalidatePath("/admin/agenda");
    return;
  }

  const payload = horarioEmpleadoSchema.parse(Object.fromEntries(formData));

  await getDb().insert(horariosEmpleado).values({
    negocioId: profile.negocioId,
    empleadoId: payload.empleadoId,
    diaSemana: payload.diaSemana,
    horaInicio: payload.horaInicio,
    horaFin: payload.horaFin,
  });

  revalidatePath("/admin/agenda");
  revalidatePath("/cliente/reservar");
}

export async function createBloqueoEmpleado(formData: FormData) {
  const profile = await requireRole(["admin"]);
  if (isDemoMode()) {
    revalidatePath("/admin/agenda");
    return;
  }

  const payload = bloqueoEmpleadoSchema.parse(Object.fromEntries(formData));

  await getDb().insert(bloqueosEmpleado).values({
    negocioId: profile.negocioId,
    empleadoId: payload.empleadoId,
    fechaInicio: new Date(payload.fechaInicio),
    fechaFin: new Date(payload.fechaFin),
    motivo: payload.motivo || null,
  });

  revalidatePath("/admin/agenda");
  revalidatePath("/cliente/reservar");
}

export async function updateCitaAdmin(formData: FormData) {
  const profile = await requireRole(["admin"]);
  if (isDemoMode()) {
    revalidatePath("/admin/agenda");
    return;
  }

  const payload = estadoCitaSchema.parse(Object.fromEntries(formData));
  const [current] = await getDb().select({ estado: citas.estado }).from(citas).where(eq(citas.id, payload.citaId)).limit(1);

  await getDb().update(citas).set({
    estado: payload.estado,
    updatedAt: new Date(),
  }).where(eq(citas.id, payload.citaId));

  await addCitaHistory({
    citaId: payload.citaId,
    actorId: profile.id,
    actorRol: "admin",
    estadoAnterior: current?.estado,
    estadoNuevo: payload.estado,
    accion: "estado_cita_admin",
    detalle: `Admin cambio cita a ${payload.estado}`,
  });

  revalidatePath("/admin/agenda");
  revalidatePath("/admin/turnos");
  revalidatePath("/empleado/mi-agenda");
  revalidatePath("/cliente/mis-citas");
}
