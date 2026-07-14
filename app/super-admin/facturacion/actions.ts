"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { negocios } from "@/lib/db/schema";

const schema = z.object({
  negocioId: z.string().uuid(),
  plan: z.enum(["starter", "pro", "enterprise"]),
  estado: z.enum(["activo", "suspendido", "cancelado"]),
  fechaFin: z.string().min(10).optional().or(z.literal("")),
});

export async function updateBilling(formData: FormData) {
  await requireRole(["super_admin"]);
  const payload = schema.parse(Object.fromEntries(formData));

  if (isDemoMode()) {
    revalidatePath("/super-admin/facturacion");
    revalidatePath("/super-admin/negocios");
    return;
  }

  await getDb()
    .update(negocios)
    .set({
      plan: payload.plan,
      estado: payload.estado,
      fechaFin: payload.fechaFin || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(negocios.id, payload.negocioId));

  revalidatePath("/super-admin/facturacion");
  revalidatePath("/super-admin/negocios");
}
