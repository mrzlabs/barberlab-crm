"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { requireRole } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity/log";
import { getDb } from "@/lib/db";
import { usuarios } from "@/lib/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const profileBasicSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  telefono: z.string().trim().max(30).optional().or(z.literal("")),
});

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

export async function updateProfileAction(formData: FormData) {
  const profile = await requireRole(["super_admin", "admin", "empleado", "cliente"]);
  const payload = profileBasicSchema.parse(Object.fromEntries(formData));

  await getDb()
    .update(usuarios)
    .set({
      nombre: payload.nombre,
      telefono: payload.telefono || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(usuarios.id, profile.id));

  revalidatePath("/perfil");
  revalidatePath(`/${profile.rol === "super_admin" ? "super-admin" : profile.rol}`, "layout");
  redirect("/perfil?updated=1");
}

export async function requestRenewalAction() {
  const profile = await requireRole(["admin", "super_admin"]);

  await logActivity({
    usuarioId: profile.id,
    negocioId: profile.negocioId,
    accion: "suscripcion_renovacion_solicitada",
    detalle: {
      negocioNombre: profile.negocioNombre,
      usuarioNombre: profile.nombre,
      email: profile.email,
      plan: profile.plan,
      fechaFin: profile.fechaFin,
    },
  });

  revalidatePath("/super-admin/dashboard");
  redirect("/perfil?renewal=1");
}
