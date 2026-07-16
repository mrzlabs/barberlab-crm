"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo-server";
import { getDb } from "@/lib/db";
import { usuarios } from "@/lib/db/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const PWD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";

function generatePassword(len = 10): string {
  let pwd = "";
  for (let i = 0; i < len; i++) {
    pwd += PWD_CHARS[Math.floor(Math.random() * PWD_CHARS.length)];
  }
  return pwd;
}

export async function resetPassword(userId: string): Promise<{ newPassword: string; error?: string }> {
  await requireRole(["super_admin"]);
  const newPassword = generatePassword(10);
  if (await isDemoMode()) {
    revalidatePath("/super-admin/usuarios");
    return { newPassword };
  }
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return { newPassword: "", error: error.message };
  await getDb().update(usuarios).set({ mustChangePassword: true }).where(eq(usuarios.id, userId)).catch(() => null);
  revalidatePath("/super-admin/usuarios");
  return { newPassword };
}

export async function toggleUsuarioActivo(id: string, activo: boolean) {
  await requireRole(["super_admin"]);
  if (await isDemoMode()) {
    revalidatePath("/super-admin/usuarios");
    return;
  }
  await getDb().update(usuarios).set({ activo }).where(eq(usuarios.id, id));
  revalidatePath("/super-admin/usuarios");
}

export async function deleteUsuario(id: string): Promise<{ ok: boolean; error?: string }> {
  const actor = await requireRole(["super_admin"]);
  if (await isDemoMode()) {
    revalidatePath("/super-admin/usuarios");
    return { ok: true };
  }

  // No permitir que el super admin se elimine a sí mismo
  if (actor.id === id) {
    return { ok: false, error: "No puedes eliminar tu propia cuenta." };
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor." };
  }

  // 1) Borrar de Supabase Auth. Si el usuario ya no existe en Auth, seguimos
  //    igual para limpiar la fila local (evita el error que reventaba la UI).
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error && !/not.?found|does not exist/i.test(error.message)) {
      return { ok: false, error: `No se pudo eliminar en Auth: ${error.message}` };
    }
  } catch (e) {
    return { ok: false, error: `Error al conectar con Supabase Auth: ${(e as Error).message}` };
  }

  // 2) Borrar la fila local (las FKs son cascade/set null, no debería fallar).
  try {
    await getDb().delete(usuarios).where(eq(usuarios.id, id));
  } catch (e) {
    return { ok: false, error: `Usuario eliminado de Auth pero no de la base: ${(e as Error).message}` };
  }

  revalidatePath("/super-admin/usuarios");
  return { ok: true };
}
