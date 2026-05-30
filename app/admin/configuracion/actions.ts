"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { negocios } from "@/lib/db/schema";
import { negocioSelfSchema } from "@/lib/validations/admin";

export async function updateMiNegocio(formData: FormData) {
  const profile = await requireRole(["admin", "super_admin"]);
  const payload = negocioSelfSchema.parse(Object.fromEntries(formData));

  if (profile.rol !== "super_admin" && profile.negocioId !== payload.negocioId) {
    throw new Error("No puedes editar otro negocio");
  }

  await getDb().update(negocios).set({
    nombre: payload.nombre.trim(),
    telefono: payload.telefono || null,
    correo: payload.correo || null,
    direccion: payload.direccion || null,
    representante: payload.representante || null,
    tipoDocumento: payload.tipoDocumento || null,
    numeroDocumento: payload.numeroDocumento || null,
    ciudadIndicativo: payload.ciudadIndicativo || null,
    contactoPrincipal: payload.contactoPrincipal || null,
    descripcion: payload.descripcion || null,
    slogan: payload.slogan || payload.descripcion?.slice(0, 150) || null,
    logoUrl: payload.logoUrl || null,
    colorPrimario: payload.colorPrimario,
    colorSecundario: payload.colorSecundario,
    colorAcento: payload.colorAcento,
    fuente: payload.fuente,
    updatedAt: new Date(),
  }).where(eq(negocios.id, payload.negocioId));

  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/dashboard");
}
