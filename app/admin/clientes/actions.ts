"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { clientes } from "@/lib/db/schema";
import { clienteAdminSchema } from "@/lib/validations/catalog";

export async function createCliente(formData: FormData) {
  await requireRole(["admin"]);
  if (isDemoMode()) {
    revalidatePath("/admin/clientes");
    return;
  }

  const payload = clienteAdminSchema.parse(Object.fromEntries(formData));

  await getDb().insert(clientes).values({
    nombre: payload.nombre.trim(),
    telefono: payload.telefono.trim(),
    email: payload.email || null,
    notas: payload.notas || null,
  });

  revalidatePath("/admin/clientes");
}
