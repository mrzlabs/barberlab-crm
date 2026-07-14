"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo";
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
  if (isDemoMode()) {
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
  if (isDemoMode()) {
    revalidatePath("/super-admin/usuarios");
    return;
  }
  await getDb().update(usuarios).set({ activo }).where(eq(usuarios.id, id));
  revalidatePath("/super-admin/usuarios");
}

export async function deleteUsuario(id: string) {
  await requireRole(["super_admin"]);
  if (isDemoMode()) {
    revalidatePath("/super-admin/usuarios");
    return;
  }
  const supabase = createSupabaseAdminClient();
  // Delete from Supabase Auth (cascades to usuarios via DB trigger or handled manually)
  await supabase.auth.admin.deleteUser(id);
  // Also delete from local usuarios table
  await getDb().delete(usuarios).where(eq(usuarios.id, id));
  revalidatePath("/super-admin/usuarios");
}
