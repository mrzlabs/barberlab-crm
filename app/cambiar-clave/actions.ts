"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { usuarios } from "@/lib/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { roleHome } from "@/lib/auth/roles";

const schema = z.object({
  password:        z.string().min(8, "Mínimo 8 caracteres"),
  passwordConfirm: z.string().min(8),
}).refine((d) => d.password === d.passwordConfirm, {
  message: "Las claves no coinciden",
  path: ["passwordConfirm"],
});

export async function cambiarClaveAction(formData: FormData) {
  const parsed = schema.safeParse({
    password:        formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });

  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message || "Datos inválidos";
    redirect(`/cambiar-clave?error=${encodeURIComponent(msg)}`);
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) redirect(`/cambiar-clave?error=${encodeURIComponent(error.message)}`);

  const profile = await requireRole(["admin", "empleado", "cliente", "super_admin"]);

  await getDb()
    .update(usuarios)
    .set({ mustChangePassword: false })
    .where(eq(usuarios.id, profile.id))
    .catch(() => null);

  redirect(roleHome[profile.rol]);
}
