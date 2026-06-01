import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { and, eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRoleFromClaims, type UserRole } from "@/lib/auth/roles";
import { getDemoUserByRole, isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { negocios, usuarios } from "@/lib/db/schema";

export type CurrentProfile = {
  id: string;
  email: string;
  rol: UserRole;
  nombre: string;
  telefono: string | null;
  negocioId: string | null;
  negocioNombre: string | null;
  negocioSlug: string | null;
  negocioCorreo: string | null;
  representante: string | null;
  descripcion: string | null;
  slogan: string | null;
  logoUrl: string | null;
  colorPrimario: string;
  colorSecundario: string;
  colorAcento: string;
  fuente: string;
  plan: string | null;
  negocioEstado: string | null;
  fechaFin: string | null;
};

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const demoRole = cookies().get("barberlab_demo_role")?.value;
  const demoUser = getDemoUserByRole(demoRole);
  if (isDemoMode() && demoUser) {
    return {
      id: demoUser.role === "super_admin" ? "00000000-0000-0000-0000-000000000099" : demoUser.role === "empleado" ? "00000000-0000-0000-0000-000000000002" : demoUser.role === "cliente" ? "00000000-0000-0000-0000-000000000003" : "00000000-0000-0000-0000-000000000001",
      email: demoUser.email,
      rol: demoUser.role,
      nombre: demoUser.nombre,
      telefono: "3503803010",
      negocioId: demoUser.role === "super_admin" ? null : "00000000-0000-0000-0000-000000000010",
      negocioNombre: demoUser.role === "super_admin" ? "MRZLABS SaaS" : "Smart Style",
      negocioSlug: demoUser.role === "super_admin" ? "mrzlabs-saas" : "smart-style",
      negocioCorreo: demoUser.role === "super_admin" ? "crm@mrzlabs.dev" : "smartstyle@barberlab.local",
      representante: demoUser.role === "super_admin" ? "MRZLABS" : "Admin Smart Style",
      descripcion: "CRM demo para validar agenda, turnos, inventario y reportes.",
      slogan: "Controla agenda, caja y rentabilidad con una operación clara.",
      logoUrl: null,
      colorPrimario: "#111827",
      colorSecundario: "#22d3ee",
      colorAcento: "#7c3aed",
      fuente: "Inter",
      plan: "pro",
      negocioEstado: "activo",
      fechaFin: renewalDate(24),
    };
  }

  const supabase = createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;

  const claimRole = getRoleFromClaims(user.app_metadata) ?? getRoleFromClaims(user.user_metadata);

  // ── Modo impersonación: super_admin operando un negocio ajeno ──────────────
  const saImp = cookies().get("barberlab_sa_imp")?.value;
  if (saImp) {
    const [requester] = await getDb()
      .select({ superAdmin: usuarios.superAdmin })
      .from(usuarios)
      .where(eq(usuarios.id, user.id))
      .limit(1);

    if (requester?.superAdmin) {
      const [imp] = await getDb()
        .select({
          id: usuarios.id,
          email: usuarios.email,
          rol: usuarios.rol,
          nombre: usuarios.nombre,
          telefono: usuarios.telefono,
          negocioId: usuarios.negocioId,
          negocioNombre: negocios.nombre,
          negocioSlug: negocios.slug,
          negocioCorreo: negocios.correo,
          representante: negocios.representante,
          descripcion: negocios.descripcion,
          slogan: negocios.slogan,
          logoUrl: negocios.logoUrl,
          colorPrimario: negocios.colorPrimario,
          colorSecundario: negocios.colorSecundario,
          colorAcento: negocios.colorAcento,
          fuente: negocios.fuente,
          plan: negocios.plan,
          negocioEstado: negocios.estado,
          fechaFin: negocios.fechaFin,
        })
        .from(usuarios)
        .leftJoin(negocios, eq(usuarios.negocioId, negocios.id))
        .where(and(
          eq(usuarios.negocioId, saImp),
          eq(usuarios.rol, "admin"),
          eq(usuarios.activo, true),
        ))
        .limit(1);

      if (imp) {
        return {
          id: imp.id,
          email: imp.email,
          rol: "admin" as UserRole,
          nombre: imp.nombre,
          telefono: imp.telefono,
          negocioId: imp.negocioId,
          negocioNombre: imp.negocioNombre,
          negocioSlug: imp.negocioSlug,
          negocioCorreo: imp.negocioCorreo,
          representante: imp.representante,
          descripcion: imp.descripcion,
          slogan: imp.slogan,
          logoUrl: imp.logoUrl,
          colorPrimario: imp.colorPrimario ?? "#111827",
          colorSecundario: imp.colorSecundario ?? "#22d3ee",
          colorAcento: imp.colorAcento ?? "#7c3aed",
          fuente: imp.fuente ?? "Inter",
          plan: imp.plan,
          negocioEstado: imp.negocioEstado,
          fechaFin: imp.fechaFin,
        };
      }
    }
  }
  // ──────────────────────────────────────────────────────────────────────────

  const [profile] = await getDb()
    .select({
      id: usuarios.id,
      email: usuarios.email,
      rol: usuarios.rol,
      nombre: usuarios.nombre,
      telefono: usuarios.telefono,
      negocioId: usuarios.negocioId,
      superAdmin: usuarios.superAdmin,
      negocioNombre: negocios.nombre,
      negocioSlug: negocios.slug,
      negocioCorreo: negocios.correo,
      representante: negocios.representante,
      descripcion: negocios.descripcion,
      slogan: negocios.slogan,
      logoUrl: negocios.logoUrl,
      colorPrimario: negocios.colorPrimario,
      colorSecundario: negocios.colorSecundario,
      colorAcento: negocios.colorAcento,
      fuente: negocios.fuente,
      plan: negocios.plan,
      negocioEstado: negocios.estado,
      fechaFin: negocios.fechaFin,
    })
    .from(usuarios)
    .leftJoin(negocios, eq(usuarios.negocioId, negocios.id))
    .where(eq(usuarios.id, user.id))
    .limit(1);

  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    rol: (profile.superAdmin ? "super_admin" : claimRole ?? profile.rol) as UserRole,
    nombre: profile.nombre,
    telefono: profile.telefono,
    negocioId: profile.negocioId,
    negocioNombre: profile.negocioNombre,
    negocioSlug: profile.negocioSlug,
    negocioCorreo: profile.negocioCorreo,
    representante: profile.representante,
    descripcion: profile.descripcion,
    slogan: profile.slogan,
    logoUrl: profile.logoUrl,
    colorPrimario: profile.colorPrimario ?? "#111827",
    colorSecundario: profile.colorSecundario ?? "#22d3ee",
    colorAcento: profile.colorAcento ?? "#7c3aed",
    fuente: profile.fuente ?? "Inter",
    plan: profile.plan,
    negocioEstado: profile.negocioEstado,
    fechaFin: profile.fechaFin,
  };
}

function renewalDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function requireRole(allowed: UserRole[]) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!allowed.includes(profile.rol)) redirect("/unauthorized");
  return profile;
}
