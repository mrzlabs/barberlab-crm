"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { slotDisponible } from "@/lib/cliente/queries";
import { addCitaHistory } from "@/lib/citas/history";
import { isDemoMode } from "@/lib/demo-server";
import { getDb } from "@/lib/db";
import { bloqueosEmpleado, citas, depositos, horariosEmpleado } from "@/lib/db/schema";
import { bloqueoEmpleadoSchema, citaAdminSchema, depositoSchema, estadoCitaSchema, horarioEmpleadoSchema } from "@/lib/validations/admin";

export async function createCitaAdmin(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (await isDemoMode()) {
    revalidatePath("/admin/agenda");
    return;
  }

  const payload = citaAdminSchema.parse(Object.fromEntries(formData));
  const inicioDate = new Date(payload.inicio);
  // Si hay duracionOverride (tatuajes/sesiones largas), recalcular fin
  const finDate = payload.duracionOverride
    ? new Date(inicioDate.getTime() + payload.duracionOverride * 60000)
    : new Date(payload.fin);
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
    throw new Error("El horario seleccionado no esta disponible");
  }

  const [created] = await getDb().insert(citas).values({
    negocioId,
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
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (await isDemoMode()) {
    revalidatePath("/admin/agenda");
    return;
  }

  const payload = horarioEmpleadoSchema.parse(Object.fromEntries(formData));

  await getDb().insert(horariosEmpleado).values({
    negocioId,
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
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (await isDemoMode()) {
    revalidatePath("/admin/agenda");
    return;
  }

  const payload = bloqueoEmpleadoSchema.parse(Object.fromEntries(formData));

  await getDb().insert(bloqueosEmpleado).values({
    negocioId,
    empleadoId: payload.empleadoId,
    fechaInicio: new Date(payload.fechaInicio).toISOString(),
    fechaFin: new Date(payload.fechaFin).toISOString(),
    motivo: payload.motivo || null,
  });

  revalidatePath("/admin/agenda");
  revalidatePath("/cliente/reservar");
}

export async function reagendarCita(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (await isDemoMode()) { revalidatePath("/admin/agenda"); return; }

  const citaId = formData.get("citaId") as string;
  const empleadoId = formData.get("empleadoId") as string;
  const servicioId = formData.get("servicioId") as string;
  const inicioDate = new Date(formData.get("inicio") as string);
  const finDate = new Date(formData.get("fin") as string);
  const inicio = inicioDate.toISOString();
  const fin = finDate.toISOString();
  const fecha = (formData.get("inicio") as string).slice(0, 10);

  const disponible = await slotDisponible({ empleadoId, servicioId, fecha, inicio: inicioDate, fin: finDate });
  if (!disponible) throw new Error("El horario seleccionado ya no está disponible");

  const [current] = await getDb()
    .select({ estado: citas.estado, inicio: citas.inicio })
    .from(citas)
    .where(and(eq(citas.id, citaId), eq(citas.negocioId, negocioId)))
    .limit(1);

  if (!current) throw new Error("Cita no encontrada");

  await getDb()
    .update(citas)
    .set({ inicio, fin, updatedAt: new Date().toISOString() })
    .where(and(eq(citas.id, citaId), eq(citas.negocioId, negocioId)));

  await addCitaHistory({
    citaId,
    actorId: profile.id,
    actorRol: "admin",
    estadoAnterior: current.estado,
    estadoNuevo: current.estado,
    accion: "cita_reagendada",
    detalle: `Reagendada de ${current.inicio} a ${inicio}`,
  });

  revalidatePath("/admin/agenda");
  revalidatePath("/admin/turnos");
  revalidatePath("/empleado/mi-agenda");
  revalidatePath("/cliente/mis-citas");
}

export async function deleteHorario(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (await isDemoMode()) { revalidatePath("/admin/agenda"); return; }

  const horarioId = formData.get("horarioId") as string;
  await getDb()
    .delete(horariosEmpleado)
    .where(and(eq(horariosEmpleado.id, horarioId), eq(horariosEmpleado.negocioId, negocioId)));

  revalidatePath("/admin/agenda");
  revalidatePath("/cliente/reservar");
}

export async function deleteBloqueo(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (await isDemoMode()) { revalidatePath("/admin/agenda"); return; }

  const bloqueoId = formData.get("bloqueoId") as string;
  await getDb()
    .delete(bloqueosEmpleado)
    .where(and(eq(bloqueosEmpleado.id, bloqueoId), eq(bloqueosEmpleado.negocioId, negocioId)));

  revalidatePath("/admin/agenda");
  revalidatePath("/cliente/reservar");
}

export async function createDeposito(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (await isDemoMode()) {
    revalidatePath("/admin/agenda");
    revalidatePath("/admin/turnos");
    return;
  }

  const payload = depositoSchema.parse(Object.fromEntries(formData));

  await getDb().insert(depositos).values({
    negocioId,
    citaId: payload.citaId,
    clienteId: payload.clienteId,
    monto: String(payload.monto),
    metodoPago: payload.metodoPago,
    estado: "recibido",
    notas: payload.notas || null,
    comprobanteUrl: payload.comprobanteUrl || null,
  });

  revalidatePath("/admin/agenda");
  revalidatePath("/admin/turnos");
}

export async function updateCitaAdmin(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (await isDemoMode()) {
    revalidatePath("/admin/agenda");
    return;
  }

  const payload = estadoCitaSchema.parse(Object.fromEntries(formData));
  const [current] = await getDb()
    .select({ estado: citas.estado })
    .from(citas)
    .where(and(eq(citas.id, payload.citaId), eq(citas.negocioId, negocioId)))
    .limit(1);

  if (!current) throw new Error("Cita no encontrada");

  await getDb().update(citas).set({
    estado: payload.estado,
    updatedAt: new Date().toISOString(),
  }).where(and(eq(citas.id, payload.citaId), eq(citas.negocioId, negocioId)));

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
