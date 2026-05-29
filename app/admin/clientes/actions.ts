"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { clientes, usuarios } from "@/lib/db/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { clienteAdminSchema } from "@/lib/validations/catalog";

export async function createCliente(formData: FormData) {
  const profile = await requireRole(["admin"]);
  if (isDemoMode()) {
    revalidatePath("/admin/clientes");
    return;
  }

  const payload = clienteAdminSchema.parse(Object.fromEntries(formData));
  let userId: string | null = null;

  if (payload.crearCuenta) {
    if (!payload.email || !payload.password) {
      throw new Error("Email y password son obligatorios para crear cuenta cliente");
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      email_confirm: true,
      app_metadata: { rol: "cliente", role: "cliente", negocio_id: profile.negocioId },
      user_metadata: {
        rol: "cliente",
        negocio_id: profile.negocioId,
        nombre: payload.nombre.trim(),
        telefono: payload.telefono.trim(),
      },
    });

    if (error || !data.user) {
      throw new Error(error?.message || "No se pudo crear el usuario Auth del cliente");
    }

    userId = data.user.id;
  }

  await getDb().transaction(async (tx) => {
    if (userId && payload.email) {
      await tx.insert(usuarios).values({
        id: userId,
        negocioId: profile.negocioId,
        email: payload.email.trim().toLowerCase(),
        rol: "cliente",
        nombre: payload.nombre.trim(),
        telefono: payload.telefono.trim(),
        activo: true,
      });
    }

    await tx.insert(clientes).values({
      negocioId: profile.negocioId,
      usuarioId: userId,
      nombre: payload.nombre.trim(),
      telefono: payload.telefono.trim(),
      email: payload.email || null,
      notas: payload.notas || null,
    });
  });

  revalidatePath("/admin/clientes");
}
