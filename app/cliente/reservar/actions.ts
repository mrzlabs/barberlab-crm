"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { citas } from "@/lib/db/schema";
import { ensureCliente, slotDisponible } from "@/lib/cliente/queries";
import { reservarSchema } from "@/lib/validations/cliente";

export async function reservarCita(formData: FormData) {
  const profile = await requireRole(["cliente"]);
  const payload = reservarSchema.parse(Object.fromEntries(formData));
  const inicio = new Date(payload.inicio);
  const fin = new Date(payload.fin);
  const fecha = payload.inicio.slice(0, 10);
  const cliente = await ensureCliente(profile);
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

  await getDb().insert(citas).values({
    clienteId: cliente.id,
    empleadoId: payload.empleadoId,
    servicioId: payload.servicioId,
    inicio,
    fin,
    estado: "reservada",
  });

  revalidatePath("/cliente/reservar");
  revalidatePath("/cliente/mis-citas");
  revalidatePath("/admin/agenda");
}
