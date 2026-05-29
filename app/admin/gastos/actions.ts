"use server";

import { revalidatePath } from "next/cache";
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

  revalidatePath("/admin/gastos");
  revalidatePath("/admin/dashboard");
}
