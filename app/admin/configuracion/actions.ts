"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { negocios } from "@/lib/db/schema";
import { configVisualSchema, negocioSelfSchema } from "@/lib/validations/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-server";

export async function updateMiNegocio(formData: FormData) {
  const profile = await requireRole(["admin", "super_admin"]);
  if (await isDemoMode()) return;
  const payload = negocioSelfSchema.parse(Object.fromEntries(formData));

  if (profile.rol !== "super_admin" && profile.negocioId !== payload.negocioId) {
    throw new Error("No puedes editar otro negocio");
  }

  const [current] = await getDb()
    .select({ configVisual: negocios.configVisual })
    .from(negocios)
    .where(eq(negocios.id, payload.negocioId))
    .limit(1);
  const existingVisual = (current?.configVisual ?? {}) as Record<string, unknown>;

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
    colorPrimario: payload.colorPrimario,
    colorSecundario: payload.colorSecundario,
    colorAcento: payload.colorAcento,
    fuente: payload.fuente,
    configVisual: { ...existingVisual, fontFamily: payload.fuente },
    comisionBase: payload.comisionBase,
    propinaEnComision: payload.propinaEnComision,
    updatedAt: new Date().toISOString(),
  }).where(eq(negocios.id, payload.negocioId));

  revalidatePath("/admin/configuracion");
  revalidatePath("/admin", "layout");
  revalidatePath("/empleado", "layout");
  revalidatePath("/cliente", "layout");
  revalidatePath("/admin/dashboard");
  revalidatePath("/perfil");
}

export async function updateConfigVisual(formData: FormData) {
  const profile = await requireRole(["admin", "super_admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (await isDemoMode()) return;

  const payload = configVisualSchema.parse({
    darkMode: formData.get("darkMode") === "true" || formData.get("darkMode") === "on",
    fontFamily: formData.get("fontFamily") || "Inter",
  });

  const [current] = await getDb()
    .select({ configVisual: negocios.configVisual })
    .from(negocios)
    .where(eq(negocios.id, negocioId))
    .limit(1);

  const existing = (current?.configVisual ?? {}) as Record<string, unknown>;

  await getDb()
    .update(negocios)
    .set({
      configVisual: { ...existing, darkMode: payload.darkMode, fontFamily: payload.fontFamily },
      fuente: payload.fontFamily,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(negocios.id, negocioId));

  revalidatePath("/admin/configuracion");
  revalidatePath("/admin", "layout");
  revalidatePath("/empleado", "layout");
  revalidatePath("/cliente", "layout");
  revalidatePath("/admin/dashboard");
  revalidatePath("/perfil");
}

export async function uploadNegocioBgPhoto(formData: FormData) {
  const profile = await requireRole(["admin", "super_admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (await isDemoMode()) return { error: "Modo demostración. Los cambios no se almacenan." };

  const file = formData.get("bgPhoto") as File | null;
  if (!file || file.size === 0) return { error: "No se seleccionó archivo" };

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowedTypes.includes(file.type)) return { error: "Formato no permitido. Usa JPG, PNG, WebP o AVIF." };
  if (file.size > 5 * 1024 * 1024) return { error: "La imagen no puede superar 5 MB." };

  const supabase = createSupabaseAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${negocioId}/brand.${ext}`;

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
      logoUrl: publicUrl,
      configVisual: { ...existing, bgPhotoUrl: publicUrl, bgPhotoStoragePath: path },
      updatedAt: new Date().toISOString(),
    })
    .where(eq(negocios.id, negocioId));

  revalidatePath("/admin/configuracion");
  revalidatePath("/admin", "layout");
  revalidatePath("/empleado", "layout");
  revalidatePath("/cliente", "layout");
  revalidatePath("/admin/dashboard");
  revalidatePath("/perfil");
  return { ok: true, url: publicUrl };
}

export async function updateWhatsAppConfig(formData: FormData) {
  const profile = await requireRole(["admin", "super_admin"]);
  const negocioId = String(formData.get("negocioId") ?? profile.negocioId ?? "");
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (profile.rol !== "super_admin" && profile.negocioId !== negocioId) throw new Error("No autorizado");
  if (await isDemoMode()) return;

  const phone = String(formData.get("whatsappPhone") ?? "").trim();
  const enabled = formData.get("whatsappEnabled") === "true";
  const templatesRaw = String(formData.get("whatsappTemplates") ?? "{}");
  let templates: Record<string, string> = {};
  try { templates = JSON.parse(templatesRaw); } catch { /* ignore */ }

  const [current] = await getDb()
    .select({ configVisual: negocios.configVisual })
    .from(negocios)
    .where(eq(negocios.id, negocioId))
    .limit(1);
  const existing = (current?.configVisual ?? {}) as Record<string, unknown>;

  const nextConfig = { ...existing, whatsapp_phone: phone, whatsapp_enabled: enabled, whatsapp_templates: templates } as Record<string, unknown>;
  await getDb()
    .update(negocios)
    .set({ configVisual: nextConfig, updatedAt: new Date().toISOString() })
    .where(eq(negocios.id, negocioId));

  revalidatePath("/admin/configuracion");
}

export async function resetConfigVisual() {
  const profile = await requireRole(["admin", "super_admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (await isDemoMode()) return;

  const defaults = {
    colorPrimario: "#00cec9",
    colorSecundario: "#6c5ce7",
    colorAcento: "#fd79a8",
    darkMode: true,
    fontFamily: "Inter",
  };

  const [current] = await getDb()
    .select({ configVisual: negocios.configVisual })
    .from(negocios)
    .where(eq(negocios.id, negocioId))
    .limit(1);

  const existing = (current?.configVisual ?? {}) as Record<string, unknown>;

  await getDb()
    .update(negocios)
    .set({
      colorPrimario: defaults.colorPrimario,
      colorSecundario: defaults.colorSecundario,
      colorAcento: defaults.colorAcento,
      fuente: defaults.fontFamily,
      configVisual: {
        ...existing,
        darkMode: defaults.darkMode,
        fontFamily: defaults.fontFamily,
      },
      updatedAt: new Date().toISOString(),
    })
    .where(eq(negocios.id, negocioId));

  revalidatePath("/admin/configuracion");
  revalidatePath("/admin", "layout");
  revalidatePath("/empleado", "layout");
  revalidatePath("/cliente", "layout");
  revalidatePath("/admin/dashboard");
  revalidatePath("/perfil");
}

export async function removeNegocioBgPhoto() {
  const profile = await requireRole(["admin", "super_admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (await isDemoMode()) return;

  const [current] = await getDb()
    .select({ configVisual: negocios.configVisual, logoUrl: negocios.logoUrl })
    .from(negocios)
    .where(eq(negocios.id, negocioId))
    .limit(1);

  const existing = (current?.configVisual ?? {}) as Record<string, unknown>;
  const storagePath = existing.bgPhotoStoragePath as string | null;

  if (storagePath) {
    const supabase = createSupabaseAdminClient();
    await supabase.storage.from("negocio-assets").remove([storagePath]).catch(() => null);
  }

  const nextLogoUrl = current?.logoUrl === existing.bgPhotoUrl ? null : current?.logoUrl ?? null;

  await getDb()
    .update(negocios)
    .set({
      logoUrl: nextLogoUrl,
      configVisual: { ...existing, bgPhotoUrl: null, bgPhotoStoragePath: null },
      updatedAt: new Date().toISOString(),
    })
    .where(eq(negocios.id, negocioId));

  revalidatePath("/admin/configuracion");
  revalidatePath("/admin", "layout");
  revalidatePath("/empleado", "layout");
  revalidatePath("/cliente", "layout");
  revalidatePath("/admin/dashboard");
  revalidatePath("/perfil");
}




/* ============================================================
   Clientes y fidelización: vertical del negocio, sistema de
   puntos y políticas de manejo de clientes (settings jsonb).
   ============================================================ */

export async function updateClientesFidelizacion(formData: FormData) {
  const profile = await requireRole(["admin", "super_admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (await isDemoMode()) return;

  const num = (name: string, fallback: number) => {
    const v = Number(formData.get(name));
    return Number.isFinite(v) && v > 0 ? Math.round(v) : fallback;
  };

  const [current] = await getDb()
    .select({ settings: negocios.settings })
    .from(negocios)
    .where(eq(negocios.id, negocioId))
    .limit(1);
  const existing = (current?.settings ?? {}) as Record<string, unknown>;

  const verticalRaw = String(formData.get("vertical") || "barberia");
  const VERTICALES_VALIDOS = ["barberia", "peluqueria", "spa_unas", "tatuajes", "restaurante", "otro"] as const;
  const vertical = (VERTICALES_VALIDOS as readonly string[]).includes(verticalRaw) ? verticalRaw as typeof VERTICALES_VALIDOS[number] : "barberia";
  const settings = {
    ...existing,
    vertical,
    puntos: {
      habilitado: formData.get("puntosHabilitado") === "on",
      pesosPorPunto: num("pesosPorPunto", 1000),
      valorPunto: num("valorPunto", 30),
      minCanje: num("minCanje", 100),
      bonoRegistro: Math.max(0, Math.round(Number(formData.get("bonoRegistro")) || 0)),
    },
    politicas: {
      textoRegistro: String(formData.get("textoRegistro") || "").slice(0, 1200) || undefined,
      consentimientoObligatorio: formData.get("consentimientoObligatorio") === "on",
    },
  };

  await getDb().update(negocios).set({
    settings,
    updatedAt: new Date().toISOString(),
  }).where(eq(negocios.id, negocioId));

  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/marketing");
}

/** Solicitud de integración (modelo FloorUX): queda pendiente para OperUX. */
export async function solicitarIntegracion(formData: FormData) {
  const profile = await requireRole(["admin", "super_admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (await isDemoMode()) return;

  const integracionId = String(formData.get("integracionId") || "").slice(0, 40);
  const accion = String(formData.get("accion") || "solicitar");
  if (!integracionId) throw new Error("Integración inválida");

  const [current] = await getDb()
    .select({ settings: negocios.settings })
    .from(negocios)
    .where(eq(negocios.id, negocioId))
    .limit(1);
  const existing = (current?.settings ?? {}) as Record<string, unknown>;
  const integraciones: Record<string, { status: "pendiente" | "activa"; managed: boolean; handle?: string; requestedAt: string; activatedAt?: string }> = { ...((existing.integraciones as Record<string, { status: "pendiente" | "activa"; managed: boolean; handle?: string; requestedAt: string; activatedAt?: string }>) ?? {}) };

  if (accion === "cancelar") {
    delete integraciones[integracionId];
  } else {
    integraciones[integracionId] = {
      status: "pendiente",
      managed: formData.get("managed") === "on",
      handle: String(formData.get("handle") || "").slice(0, 120) || undefined,
      requestedAt: new Date().toISOString(),
    };
  }

  await getDb().update(negocios).set({
    settings: { ...existing, integraciones },
    updatedAt: new Date().toISOString(),
  }).where(eq(negocios.id, negocioId));

  revalidatePath("/admin/marketing");
}
