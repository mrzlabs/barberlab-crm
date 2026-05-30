"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import { demoCreds, isDemoMode } from "@/lib/demo";
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

  if (isDemoMode()) {
    if (parsed.data.email === demoCreds.email && parsed.data.password === demoCreds.password) {
      cookies().set("barberlab_demo_role", demoCreds.role, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      redirect(parsed.data.next || "/admin/dashboard");
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
  const role = user
    ? (getRoleFromClaims(user.app_metadata) ?? getRoleFromClaims(user.user_metadata))
    : null;

  redirect(parsed.data.next || (role ? roleHome[role] : "/admin/dashboard"));
}
