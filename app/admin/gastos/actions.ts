"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { gastos } from "@/lib/db/schema";
import { gastoSchema } from "@/lib/validations/admin";

export async function createGasto(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const payload = gastoSchema.parse(Object.fromEntries(formData));

  await getDb().insert(gastos).values({
    negocioId: profile.negocioId,
    categoria: payload.categoria,
    monto: String(payload.monto),
    fecha: payload.fecha,
    descripcion: payload.descripcion || null,
    comprobanteUrl: payload.comprobanteUrl || null,
  });

  revalidatePath("/admin/dashboard");
  redirect("/admin/gastos?ok=Gasto+registrado+correctamente");
}

export async function updateGasto(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const gastoId = formData.get("gastoId") as string;
  const payload = gastoSchema.parse(Object.fromEntries(formData));

  await getDb()
    .update(gastos)
    .set({
      categoria: payload.categoria,
      monto: String(payload.monto),
      fecha: payload.fecha,
      descripcion: payload.descripcion || null,
      comprobanteUrl: payload.comprobanteUrl || null,
      updatedAt: new Date(),
    })
    .where(and(eq(gastos.id, gastoId), eq(gastos.negocioId, profile.negocioId)));

  revalidatePath("/admin/gastos");
  revalidatePath("/admin/dashboard");
}
