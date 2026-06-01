"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { usuarios } from "@/lib/db/schema";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export async function toggleUsuarioActivo(id: string, activo: boolean) {
  await requireRole(["super_admin"]);
  await getDb().update(usuarios).set({ activo }).where(eq(usuarios.id, id));
  revalidatePath("/super-admin/usuarios");
}

export async function deleteUsuario(id: string) {
  await requireRole(["super_admin"]);
  const supabase = createSupabaseAdminClient();
  // Delete from Supabase Auth (cascades to usuarios via DB trigger or handled manually)
  await supabase.auth.admin.deleteUser(id);
  // Also delete from local usuarios table
  await getDb().delete(usuarios).where(eq(usuarios.id, id));
  revalidatePath("/super-admin/usuarios");
}
