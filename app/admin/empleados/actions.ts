"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { empleados, usuarios } from "@/lib/db/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { empleadoAdminSchema } from "@/lib/validations/catalog";

export async function createEmpleado(formData: FormData) {
  const profile = await requireRole(["admin"]);
  if (isDemoMode()) {
    revalidatePath("/admin/empleados");
    return;
  }

  const payload = empleadoAdminSchema.parse({
    ...Object.fromEntries(formData),
    activo: formData.get("activo") === "on",
  });
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    email_confirm: true,
    app_metadata: { rol: "empleado", role: "empleado", negocio_id: profile.negocioId },
    user_metadata: {
      rol: "empleado",
      negocio_id: profile.negocioId,
      nombre: payload.nombre.trim(),
      telefono: payload.telefono.trim(),
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message || "No se pudo crear el usuario Auth del empleado");
  }

  const userId = data.user.id;

  await getDb().transaction(async (tx) => {
    await tx.insert(usuarios).values({
      id: userId,
      negocioId: profile.negocioId,
      email: payload.email.trim().toLowerCase(),
      rol: "empleado",
      nombre: payload.nombre.trim(),
      telefono: payload.telefono.trim(),
      activo: payload.activo,
    });

    await tx.insert(empleados).values({
      negocioId: profile.negocioId,
      usuarioId: userId,
      especialidad: payload.especialidad,
      comisionPct: String(payload.comisionPct),
      activo: payload.activo,
    });
  });

  revalidatePath("/admin/empleados");
  revalidatePath("/cliente/reservar");
}
