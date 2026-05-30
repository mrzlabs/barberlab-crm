"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { inventario, movInventario } from "@/lib/db/schema";
import { inventarioSchema, movInventarioSchema } from "@/lib/validations/admin";

export async function createItem(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const raw = Object.fromEntries(formData);
  const payload = inventarioSchema.parse({
    ...raw,
    activo: formData.get("activo") === "on",
    visibleCliente: formData.get("visibleCliente") === "on",
  });

  await getDb().insert(inventario).values({
    negocioId: profile.negocioId,
    sku: payload.sku.trim().toUpperCase(),
    nombre: payload.nombre.trim(),
    categoria: payload.categoria.trim(),
    unidad: payload.unidad.trim(),
    stock: String(payload.stock),
    costoUnitario: String(payload.costoUnitario),
    stockMinimo: String(payload.stockMinimo),
    precioVenta: String(payload.precioVenta),
    visibleCliente: payload.visibleCliente,
    activo: payload.activo,
  });

  revalidatePath("/admin/inventario");
  revalidatePath("/admin/dashboard");
}

export async function createMov(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const payload = movInventarioSchema.parse(Object.fromEntries(formData));
  const db = getDb();

  await db.transaction(async (tx) => {
    await tx.insert(movInventario).values({
      negocioId: profile.negocioId,
      inventarioId: payload.inventarioId,
      tipo: payload.tipo,
      cantidad: String(payload.cantidad),
      motivo: payload.motivo.trim(),
    });

    if (payload.tipo === "ajuste") {
      await tx
        .update(inventario)
        .set({ stock: String(payload.cantidad), updatedAt: new Date() })
        .where(eq(inventario.id, payload.inventarioId));
      return;
    }

    const sign = payload.tipo === "entrada" ? 1 : -1;
    await tx
      .update(inventario)
      .set({
        stock: sql`${inventario.stock} + ${String(payload.cantidad * sign)}`,
        updatedAt: new Date(),
      })
      .where(eq(inventario.id, payload.inventarioId));
  });

  revalidatePath("/admin/inventario");
  revalidatePath("/admin/dashboard");
}

export async function updateInventario(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const inventarioId = formData.get("inventarioId") as string;

  const nombre = ((formData.get("nombre") as string) ?? "").trim();
  const categoria = ((formData.get("categoria") as string) ?? "").trim();
  const unidad = ((formData.get("unidad") as string) ?? "").trim();
  const stockMinimo = String(Math.max(0, Number(formData.get("stockMinimo"))));
  const costoUnitario = String(Math.max(0, Number(formData.get("costoUnitario"))));
  const precioVenta = String(Math.max(0, Number(formData.get("precioVenta"))));
  const visibleCliente = formData.get("visibleCliente") === "on";
  const activo = formData.get("activo") === "on";

  await getDb()
    .update(inventario)
    .set({ nombre, categoria, unidad, stockMinimo, costoUnitario, precioVenta, visibleCliente, activo, updatedAt: new Date() })
    .where(and(eq(inventario.id, inventarioId), eq(inventario.negocioId, profile.negocioId)));

  revalidatePath("/admin/inventario");
  revalidatePath("/admin/dashboard");
}
