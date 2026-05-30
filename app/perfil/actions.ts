"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireRole } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function logoutAction() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  cookies().delete("barberlab_demo_role");
  redirect("/login");
}

export async function resetPasswordAction() {
  const profile = await requireRole(["super_admin", "admin", "empleado", "cliente"]);
  const supabase = createSupabaseServerClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/login`;
  await supabase.auth.resetPasswordForEmail(profile.email, { redirectTo });
  redirect("/perfil?reset=1");
}
