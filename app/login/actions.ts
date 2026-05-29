"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import { demoCreds, isDemoMode } from "@/lib/demo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional().or(z.literal("")),
  next: z.string().optional(),
  mode: z.enum(["password", "magic"]),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
    mode: formData.get("mode"),
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
  const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback${parsed.data.next ? `?next=${parsed.data.next}` : ""}`;

  if (parsed.data.mode === "magic") {
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data.email,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) redirect("/login?error=auth");
    redirect("/login?sent=1");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password || "",
  });

  if (error) redirect("/login?error=auth");
  redirect(parsed.data.next || "/");
}
