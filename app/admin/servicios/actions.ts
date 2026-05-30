"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { servicios } from "@/lib/db/schema";
import { servicioAdminSchema } from "@/lib/validations/catalog";

export async function createServicio(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (isDemoMode()) {
    revalidatePath("/admin/servicios");
    return;
  }

  const payload = servicioAdminSchema.parse({
    ...Object.fromEntries(formData),
    activo: formData.get("activo") === "on",
  });

  await getDb().insert(servicios).values({
    negocioId,
    categoria: payload.categoria,
    nombre: payload.nombre.trim(),
    duracionMin: payload.duracionMin,
    precio: String(payload.precio),
    costoInsumo: String(payload.costoInsumo),
    activo: payload.activo,
  });

  revalidatePath("/cliente/reservar");
  redirect("/admin/servicios?ok=Servicio+creado+correctamente");
}

export async function toggleServicio(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (isDemoMode()) { revalidatePath("/admin/servicios"); return; }

  const servicioId = formData.get("servicioId") as string;
  const activo = formData.get("activo") === "true";

  await getDb()
    .update(servicios)
    .set({ activo, updatedAt: new Date() })
    .where(and(eq(servicios.id, servicioId), eq(servicios.negocioId, negocioId)));

  revalidatePath("/admin/servicios");
  revalidatePath("/cliente/reservar");
}

export async function updateServicio(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (isDemoMode()) { revalidatePath("/admin/servicios"); return; }

  const servicioId = formData.get("servicioId") as string;
  const payload = servicioAdminSchema.parse({
    ...Object.fromEntries(formData),
    activo: formData.get("activo") === "on",
  });

  await getDb()
    .update(servicios)
    .set({
      categoria: payload.categoria,
      nombre: payload.nombre.trim(),
      duracionMin: payload.duracionMin,
      precio: String(payload.precio),
      costoInsumo: String(payload.costoInsumo),
      activo: payload.activo,
      updatedAt: new Date(),
    })
    .where(and(eq(servicios.id, servicioId), eq(servicios.negocioId, negocioId)));

  revalidatePath("/admin/servicios");
  revalidatePath("/cliente/reservar");
}
