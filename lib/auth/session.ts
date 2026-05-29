import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRoleFromClaims, type UserRole } from "@/lib/auth/roles";

export type CurrentProfile = {
  id: string;
  email: string;
  rol: UserRole;
  nombre: string;
  telefono: string | null;
};

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const role = getRoleFromClaims(user.app_metadata) ?? getRoleFromClaims(user.user_metadata);
  if (!role) return null;

  const { data: profile } = await supabase
    .from("usuarios")
    .select("id,email,rol,nombre,telefono")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    rol: profile.rol as UserRole,
    nombre: profile.nombre,
    telefono: profile.telefono,
  };
}

export async function requireRole(allowed: UserRole[]) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!allowed.includes(profile.rol)) redirect("/unauthorized");
  return profile;
}
