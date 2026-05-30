"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export async function changePasswordAction(formData: FormData) {
  const profile = await requireRole(["admin", "super_admin"]);

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) redirect("/admin/perfil?error=invalid");

  if (parsed.data.newPassword !== parsed.data.confirmPassword) {
    redirect("/admin/perfil?error=mismatch");
  }

  const supabase = createSupabaseServerClient();

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: parsed.data.currentPassword,
  });

  if (signInError) redirect("/admin/perfil?error=current");

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });

  if (error) redirect("/admin/perfil?error=update");
  redirect("/admin/perfil?success=1");
}
