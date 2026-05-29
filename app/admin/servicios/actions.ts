"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { servicios } from "@/lib/db/schema";
import { servicioAdminSchema } from "@/lib/validations/catalog";

export async function createServicio(formData: FormData) {
  await requireRole(["admin"]);
  if (isDemoMode()) {
    revalidatePath("/admin/servicios");
    return;
  }

  const payload = servicioAdminSchema.parse({
    ...Object.fromEntries(formData),
    activo: formData.get("activo") === "on",
  });

  await getDb().insert(servicios).values({
    categoria: payload.categoria,
    nombre: payload.nombre.trim(),
    duracionMin: payload.duracionMin,
    precio: String(payload.precio),
    costoInsumo: String(payload.costoInsumo),
    activo: payload.activo,
  });

  revalidatePath("/admin/servicios");
  revalidatePath("/cliente/reservar");
}
