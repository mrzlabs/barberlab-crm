"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo-server";
import { getDb } from "@/lib/db";
import { empleados, usuarios } from "@/lib/db/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { empleadoAdminSchema } from "@/lib/validations/catalog";

export async function createEmpleado(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (await isDemoMode()) {
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
    app_metadata: { rol: "empleado", role: "empleado", negocio_id: negocioId },
    user_metadata: {
      rol: "empleado",
      negocio_id: negocioId,
      nombre: payload.nombre.trim(),
      telefono: payload.telefono.trim(),
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message || "No se pudo crear el usuario Auth del empleado");
  }

  const userId = data.user.id;

  try {
    await getDb().transaction(async (tx) => {
      await tx.insert(usuarios).values({
        id: userId,
        negocioId,
        email: payload.email.trim().toLowerCase(),
        rol: "empleado",
        nombre: payload.nombre.trim(),
        telefono: payload.telefono.trim(),
        activo: payload.activo,
      });

      await tx.insert(empleados).values({
        negocioId,
        usuarioId: userId,
        especialidad: payload.especialidad,
        comisionPct: String(payload.comisionPct),
        activo: payload.activo,
      });
    });
  } catch (dbError) {
    await createSupabaseAdminClient().auth.admin.deleteUser(userId).catch(() => {});
    throw new Error("Error al guardar el empleado en base de datos. Usuario Auth eliminado.");
  }

  revalidatePath("/cliente/reservar");
  redirect("/admin/empleados?ok=Empleado+creado+correctamente");
}

export async function toggleEmpleado(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (await isDemoMode()) { revalidatePath("/admin/empleados"); return; }

  const empleadoId = formData.get("empleadoId") as string;
  const usuarioId = formData.get("usuarioId") as string;
  const activo = formData.get("activo") === "true";

  await getDb().transaction(async (tx) => {
    await tx.update(usuarios)
      .set({ activo, updatedAt: new Date().toISOString() })
      .where(and(eq(usuarios.id, usuarioId), eq(usuarios.negocioId, negocioId)));
    await tx.update(empleados)
      .set({ activo, updatedAt: new Date().toISOString() })
      .where(and(eq(empleados.id, empleadoId), eq(empleados.negocioId, negocioId)));
  });

  revalidatePath("/admin/empleados");
  revalidatePath("/cliente/reservar");
}

export async function updateEmpleado(formData: FormData) {
  const profile = await requireRole(["admin"]);
  const negocioId = profile.negocioId;
  if (!negocioId) throw new Error("Sin negocio asignado");
  if (await isDemoMode()) { revalidatePath("/admin/empleados"); return; }

  const empleadoId = formData.get("empleadoId") as string;
  const usuarioId = formData.get("usuarioId") as string;
  const nombre = ((formData.get("nombre") as string) ?? "").trim();
  const telefono = ((formData.get("telefono") as string) ?? "").trim();
  const especialidad = formData.get("especialidad") as "barberia" | "peluqueria" | "spa_unas" | "tatuajes";
  const comisionPct = String(Math.max(0, Math.min(100, Number(formData.get("comisionPct")))));
  const activo = formData.get("activo") === "on";

  await getDb().transaction(async (tx) => {
    await tx.update(usuarios)
      .set({ nombre, telefono, activo, updatedAt: new Date().toISOString() })
      .where(and(eq(usuarios.id, usuarioId), eq(usuarios.negocioId, negocioId)));
    await tx.update(empleados)
      .set({ especialidad, comisionPct, activo, updatedAt: new Date().toISOString() })
      .where(and(eq(empleados.id, empleadoId), eq(empleados.negocioId, negocioId)));
  });

  revalidatePath("/admin/empleados");
  revalidatePath("/cliente/reservar");
}
