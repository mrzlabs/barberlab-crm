"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDemoUser, isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { negocios, usuarios } from "@/lib/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRoleFromClaims, roleHome } from "@/lib/auth/roles";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  next: z.string().optional(),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) redirect("/login?error=invalid");

  const safeNext = parsed.data.next?.startsWith("/") && !parsed.data.next.startsWith("//")
    ? parsed.data.next
    : undefined;

  if (isDemoMode()) {
    const demoUser = getDemoUser(parsed.data.email, parsed.data.password);
    if (demoUser) {
      cookies().set("barberlab_demo_role", demoUser.role, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      redirect(safeNext || roleHome[demoUser.role]);
    }
    redirect("/login?error=auth");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) redirect("/login?error=auth");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=auth");

  const [profile] = await getDb()
    .select({
      rol: usuarios.rol,
      superAdmin: usuarios.superAdmin,
      activo: usuarios.activo,
      negocioEstado: negocios.estado,
    })
    .from(usuarios)
    .leftJoin(negocios, eq(usuarios.negocioId, negocios.id))
    .where(eq(usuarios.id, user.id))
    .limit(1);

  const role = getRoleFromClaims(user.app_metadata) ?? getRoleFromClaims(user.user_metadata) ?? (profile?.superAdmin ? "super_admin" : profile?.rol);
  if (!role || !profile) redirect("/login?error=profile");

  const negocioActivo = role === "super_admin" || !profile.negocioEstado || profile.negocioEstado === "activo";
  if (!profile.activo || !negocioActivo) redirect("/login?error=inactive");

  redirect(safeNext || roleHome[role]);
}
