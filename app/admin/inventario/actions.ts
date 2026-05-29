"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { inventario, movInventario } from "@/lib/db/schema";
import { inventarioSchema, movInventarioSchema } from "@/lib/validations/admin";

export async function createItem(formData: FormData) {
  await requireRole(["admin"]);
  const raw = Object.fromEntries(formData);
  const payload = inventarioSchema.parse({
    ...raw,
    activo: formData.get("activo") === "on",
  });

  await getDb().insert(inventario).values({
    sku: payload.sku.trim().toUpperCase(),
    nombre: payload.nombre.trim(),
    categoria: payload.categoria.trim(),
    unidad: payload.unidad.trim(),
    stock: String(payload.stock),
    costoUnitario: String(payload.costoUnitario),
    stockMinimo: String(payload.stockMinimo),
    activo: payload.activo,
  });

  revalidatePath("/admin/inventario");
  revalidatePath("/admin/dashboard");
}

export async function createMov(formData: FormData) {
  await requireRole(["admin"]);
  const payload = movInventarioSchema.parse(Object.fromEntries(formData));
  const db = getDb();

  await db.transaction(async (tx) => {
    await tx.insert(movInventario).values({
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
