"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { inventario, movInventario } from "@/lib/db/schema";
import { inventarioSchema, movInventarioSchema } from "@/lib/validations/admin";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

async function uploadInventarioFoto(file: File | null, negocioId: string, itemId?: string) {
  if (!file || file.size === 0) return null;
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif"];
  if (!allowed.includes(file.type)) throw new Error("Formato de foto no permitido");
  if (file.size > 5 * 1024 * 1024) throw new Error("La foto no puede superar 5 MB");

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const key = itemId || crypto.randomUUID();
  const path = `${negocioId}/inventario/${key}.${ext}`;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from("negocio-assets").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from("negocio-assets").getPublicUrl(path).data.publicUrl;
}

export async function createItem(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  const raw = Object.fromEntries(formData);
  const payload = inventarioSchema.parse({
    ...raw,
    activo: formData.get("activo") === "on",
    visibleCliente: formData.get("visibleCliente") === "on",
  });
  const fotoUrl = await uploadInventarioFoto(formData.get("foto") as File | null, negocioId);

  await getDb().insert(inventario).values({
    negocioId,
    sku: payload.sku.trim().toUpperCase(),
    nombre: payload.nombre.trim(),
    categoria: payload.categoria.trim(),
    unidad: payload.unidad.trim(),
    stock: String(payload.stock),
    costoUnitario: String(payload.costoUnitario),
    stockMinimo: String(payload.stockMinimo),
    precioVenta: String(payload.precioVenta),
    visibleCliente: payload.visibleCliente,
    descripcion: payload.descripcion || null,
    fotoUrl,
    activo: payload.activo,
  });

  revalidatePath("/admin/inventario");
  revalidatePath("/admin/dashboard");
}

export async function createMov(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  const payload = movInventarioSchema.parse(Object.fromEntries(formData));
  const db = getDb();

  await db.transaction(async (tx) => {
    await tx.insert(movInventario).values({
      negocioId,
      inventarioId: payload.inventarioId,
      tipo: payload.tipo,
      cantidad: String(payload.cantidad),
      motivo: payload.motivo.trim(),
    });

    if (payload.tipo === "ajuste") {
      await tx
        .update(inventario)
        .set({ stock: String(payload.cantidad), updatedAt: new Date().toISOString() })
        .where(and(eq(inventario.id, payload.inventarioId), eq(inventario.negocioId, negocioId)));
      return;
    }

    const sign = payload.tipo === "entrada" ? 1 : -1;
    await tx
      .update(inventario)
      .set({
        stock: sql`${inventario.stock} + ${String(payload.cantidad * sign)}`,
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(inventario.id, payload.inventarioId), eq(inventario.negocioId, negocioId)));
  });

  revalidatePath("/admin/inventario");
  revalidatePath("/admin/dashboard");
}

export async function updateInventario(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  const inventarioId = formData.get("inventarioId") as string;

  const nombre = ((formData.get("nombre") as string) ?? "").trim();
  const categoria = ((formData.get("categoria") as string) ?? "").trim();
  const unidad = ((formData.get("unidad") as string) ?? "").trim();
  const stockMinimo = String(Math.max(0, Number(formData.get("stockMinimo"))));
  const costoUnitario = String(Math.max(0, Number(formData.get("costoUnitario"))));
  const precioVenta = String(Math.max(0, Number(formData.get("precioVenta"))));
  const descripcion = String(formData.get("descripcion") || "").trim();
  const currentFotoUrl = String(formData.get("fotoUrl") || "");
  const nextFotoUrl = await uploadInventarioFoto(formData.get("foto") as File | null, negocioId, inventarioId);
  const visibleCliente = formData.get("visibleCliente") === "on";
  const activo = formData.get("activo") === "on";

  await getDb()
    .update(inventario)
    .set({
      nombre,
      categoria,
      unidad,
      stockMinimo,
      costoUnitario,
      precioVenta,
      descripcion: descripcion || null,
      fotoUrl: nextFotoUrl || currentFotoUrl || null,
      visibleCliente,
      activo,
      updatedAt: new Date().toISOString(),
    })
    .where(and(eq(inventario.id, inventarioId), eq(inventario.negocioId, negocioId)));

  revalidatePath("/admin/inventario");
  revalidatePath("/admin/dashboard");
}
