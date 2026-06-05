"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { clienteArchivos, depositos } from "@/lib/db/schema";
import { clienteArchivoSchema, depositoEstadoSchema } from "@/lib/validations/admin";

// ── Archivos / Book ───────────────────────────────────────────────────────

export async function addClienteArchivo(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  const clienteId = formData.get("clienteId") as string;
  if (isDemoMode()) {
    revalidatePath(`/admin/clientes/${clienteId}`);
    return;
  }

  const payload = clienteArchivoSchema.parse(Object.fromEntries(formData));

  await getDb().insert(clienteArchivos).values({
    negocioId,
    clienteId: payload.clienteId,
    citaId: payload.citaId || null,
    tipo: payload.tipo,
    url: payload.url,
    storagePath: payload.storagePath || null,
    nombre: payload.nombre,
    descripcion: payload.descripcion || null,
    createdBy: profile.id,
  });

  revalidatePath(`/admin/clientes/${payload.clienteId}`);
}

export async function deleteClienteArchivo(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  const archivoId = formData.get("archivoId") as string;
  const clienteId = formData.get("clienteId") as string;
  if (isDemoMode()) {
    revalidatePath(`/admin/clientes/${clienteId}`);
    return;
  }

  await getDb()
    .delete(clienteArchivos)
    .where(and(eq(clienteArchivos.id, archivoId), eq(clienteArchivos.negocioId, negocioId)));

  revalidatePath(`/admin/clientes/${clienteId}`);
}

// ── Depósitos ─────────────────────────────────────────────────────────────

export async function updateDepositoEstado(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  const clienteId = formData.get("clienteId") as string;
  if (isDemoMode()) {
    revalidatePath(`/admin/clientes/${clienteId}`);
    revalidatePath("/admin/turnos");
    return;
  }

  const payload = depositoEstadoSchema.parse(Object.fromEntries(formData));

  await getDb()
    .update(depositos)
    .set({ estado: payload.estado, updatedAt: new Date().toISOString() })
    .where(and(eq(depositos.id, payload.depositoId), eq(depositos.negocioId, negocioId)));

  revalidatePath(`/admin/clientes/${clienteId}`);
  revalidatePath("/admin/turnos");
}
