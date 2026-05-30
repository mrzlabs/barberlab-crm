"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { clientes, usuarios } from "@/lib/db/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { clienteAdminSchema } from "@/lib/validations/catalog";

export async function createCliente(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
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
      app_metadata: { rol: "cliente", role: "cliente", negocio_id: negocioId },
      user_metadata: {
        rol: "cliente",
        negocio_id: negocioId,
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
        negocioId,
        email: payload.email.trim().toLowerCase(),
        rol: "cliente",
        nombre: payload.nombre.trim(),
        telefono: payload.telefono.trim(),
        activo: true,
      });
    }

    await tx.insert(clientes).values({
      negocioId,
      usuarioId: userId,
      nombre: payload.nombre.trim(),
      telefono: payload.telefono.trim(),
      email: payload.email || null,
      notas: payload.notas || null,
    });
  });

  redirect("/admin/clientes?ok=Cliente+guardado+correctamente");
}

export async function updateCliente(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (isDemoMode()) { revalidatePath("/admin/clientes"); return; }

  const clienteId = formData.get("clienteId") as string;
  const nombre = ((formData.get("nombre") as string) ?? "").trim();
  const telefono = ((formData.get("telefono") as string) ?? "").trim();
  const email = ((formData.get("email") as string) ?? "").trim() || null;
  const notas = (formData.get("notas") as string | null) || null;

  await getDb()
    .update(clientes)
    .set({ nombre, telefono, email, notas, updatedAt: new Date() })
    .where(and(eq(clientes.id, clienteId), eq(clientes.negocioId, negocioId)));

  revalidatePath("/admin/clientes");
}
