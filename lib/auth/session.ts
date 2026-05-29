import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRoleFromClaims, type UserRole } from "@/lib/auth/roles";
import { demoCreds, isDemoMode } from "@/lib/demo";

export type CurrentProfile = {
  id: string;
  email: string;
  rol: UserRole;
  nombre: string;
  telefono: string | null;
  negocioId: string | null;
  negocioNombre: string | null;
  negocioSlug: string | null;
  logoUrl: string | null;
  colorPrimario: string;
  colorSecundario: string;
  colorAcento: string;
  fuente: string;
  plan: string | null;
  negocioEstado: string | null;
};

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const demoRole = cookies().get("barberlab_demo_role")?.value;
  if (isDemoMode() && demoRole === "admin") {
    return {
      id: "00000000-0000-0000-0000-000000000001",
      email: demoCreds.email,
      rol: "admin",
      nombre: "Admin BarberLab",
      telefono: "3503803010",
      negocioId: "00000000-0000-0000-0000-000000000010",
      negocioNombre: "BarberLab Demo",
      negocioSlug: "barberlab-demo",
      logoUrl: null,
      colorPrimario: "#111827",
      colorSecundario: "#22d3ee",
      colorAcento: "#7c3aed",
      fuente: "Inter",
      plan: "pro",
      negocioEstado: "activo",
    };
  }

  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const claimRole = getRoleFromClaims(user.app_metadata) ?? getRoleFromClaims(user.user_metadata);

  const { data: profile } = await supabase
    .from("usuarios")
    .select("id,email,rol,nombre,telefono,negocio_id,super_admin,negocios(id,nombre,slug,logo_url,color_primario,color_secundario,color_acento,fuente,plan,estado)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  const negocio = Array.isArray(profile.negocios) ? profile.negocios[0] : profile.negocios;

  return {
    id: profile.id,
    email: profile.email,
    rol: (profile.super_admin ? "super_admin" : claimRole ?? profile.rol) as UserRole,
    nombre: profile.nombre,
    telefono: profile.telefono,
    negocioId: profile.negocio_id,
    negocioNombre: negocio?.nombre ?? null,
    negocioSlug: negocio?.slug ?? null,
    logoUrl: negocio?.logo_url ?? null,
    colorPrimario: negocio?.color_primario ?? "#111827",
    colorSecundario: negocio?.color_secundario ?? "#22d3ee",
    colorAcento: negocio?.color_acento ?? "#7c3aed",
    fuente: negocio?.fuente ?? "Inter",
    plan: negocio?.plan ?? null,
    negocioEstado: negocio?.estado ?? null,
  };
}

export async function requireRole(allowed: UserRole[]) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!allowed.includes(profile.rol)) redirect("/unauthorized");
  return profile;
}
