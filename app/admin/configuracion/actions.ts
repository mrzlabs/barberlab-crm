"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { negocios } from "@/lib/db/schema";
import { negocioSelfSchema } from "@/lib/validations/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
    comisionBase: payload.comisionBase,
    propinaEnComision: payload.propinaEnComision,
    updatedAt: new Date(),
  }).where(eq(negocios.id, payload.negocioId));

  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/dashboard");
}

export async function updateConfigVisual(formData: FormData) {
  const profile = await requireRole(["admin", "super_admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");

  const darkMode = formData.get("darkMode") === "true";

  const [current] = await getDb()
    .select({ configVisual: negocios.configVisual })
    .from(negocios)
    .where(eq(negocios.id, negocioId))
    .limit(1);

  const existing = (current?.configVisual ?? {}) as Record<string, unknown>;

  await getDb()
    .update(negocios)
    .set({ configVisual: { ...existing, darkMode }, updatedAt: new Date() })
    .where(eq(negocios.id, negocioId));

  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/dashboard");
}

export async function uploadNegocioBgPhoto(formData: FormData) {
  const profile = await requireRole(["admin", "super_admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");

  const file = formData.get("bgPhoto") as File | null;
  if (!file || file.size === 0) return { error: "No se seleccionó archivo" };

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowedTypes.includes(file.type)) return { error: "Formato no permitido. Usa JPG, PNG, WebP o AVIF." };
  if (file.size > 5 * 1024 * 1024) return { error: "La imagen no puede superar 5 MB." };

  const supabase = createSupabaseServerClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${negocioId}/bg.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("negocio-assets")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from("negocio-assets").getPublicUrl(path);

  const [current] = await getDb()
    .select({ configVisual: negocios.configVisual })
    .from(negocios)
    .where(eq(negocios.id, negocioId))
    .limit(1);

  const existing = (current?.configVisual ?? {}) as Record<string, unknown>;

  await getDb()
    .update(negocios)
    .set({
      configVisual: { ...existing, bgPhotoUrl: publicUrl, bgPhotoStoragePath: path },
      updatedAt: new Date(),
    })
    .where(eq(negocios.id, negocioId));

  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/dashboard");
  return { ok: true, url: publicUrl };
}

export async function removeNegocioBgPhoto() {
  const profile = await requireRole(["admin", "super_admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");

  const [current] = await getDb()
    .select({ configVisual: negocios.configVisual })
    .from(negocios)
    .where(eq(negocios.id, negocioId))
    .limit(1);

  const existing = (current?.configVisual ?? {}) as Record<string, unknown>;
  const storagePath = existing.bgPhotoStoragePath as string | null;

  if (storagePath) {
    const supabase = createSupabaseServerClient();
    await supabase.storage.from("negocio-assets").remove([storagePath]).catch(() => null);
  }

  await getDb()
    .update(negocios)
    .set({
      configVisual: { ...existing, bgPhotoUrl: null, bgPhotoStoragePath: null },
      updatedAt: new Date(),
    })
    .where(eq(negocios.id, negocioId));

  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/dashboard");
}
