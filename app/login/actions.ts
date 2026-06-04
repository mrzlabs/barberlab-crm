"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDemoUser, isDemoMode } from "@/lib/demo";
import { getDb } from "@/lib/db";
import { negocios, usuarios } from "@/lib/db/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRoleFromClaims, roleHome } from "@/lib/auth/roles";

// WARNING: This rate limiter uses an in-process Map. In serverless/Vercel deployments
// each function instance has its own Map, so a distributed attacker can bypass limits
// by hitting different instances. Before exposing this login to the public internet,
// replace with a shared store: Vercel KV, Upstash Redis, or a Supabase rate_limits table.
// See README.md § "Seguridad pendiente antes de produccion".
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_BLOCK_MS = 5 * 60 * 1000;

type LoginAttempt = { count: number; blockedUntil: number };

declare global {
  var __barberlabLoginAttempts: Map<string, LoginAttempt> | undefined;
}

const loginAttempts = globalThis.__barberlabLoginAttempts ?? new Map<string, LoginAttempt>();
globalThis.__barberlabLoginAttempts = loginAttempts;

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().trim().min(8),
  next: z.string().trim().optional(),
});

function getClientIp() {
  const store = headers();
  const forwarded = store.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || store.get("x-real-ip")?.trim() || "local";
}

function isBlocked(ip: string) {
  const attempt = loginAttempts.get(ip);
  if (!attempt) return false;
  if (attempt.blockedUntil <= Date.now()) {
    loginAttempts.delete(ip);
    return false;
  }
  return true;
}

function recordFailure(ip: string) {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  const count = (attempt?.blockedUntil && attempt.blockedUntil > now ? attempt.count : attempt?.count ?? 0) + 1;
  loginAttempts.set(ip, {
    count,
    blockedUntil: count >= MAX_LOGIN_ATTEMPTS ? now + LOGIN_BLOCK_MS : 0,
  });
}

function clearFailures(ip: string) {
  loginAttempts.delete(ip);
}

export async function loginAction(formData: FormData) {
  const ip = getClientIp();
  if (isBlocked(ip)) redirect("/login?error=rate");

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });

  if (!parsed.success) {
    recordFailure(ip);
    redirect("/login?error=invalid");
  }

  const safeNext = parsed.data.next?.startsWith("/") && !parsed.data.next.startsWith("//")
    ? parsed.data.next
    : undefined;

  if (isDemoMode()) {
    const demoUser = getDemoUser(parsed.data.email, parsed.data.password);
    if (demoUser) {
      clearFailures(ip);
      cookies().set("barberlab_demo_role", demoUser.role, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      redirect(safeNext || roleHome[demoUser.role]);
    }
    recordFailure(ip);
    redirect("/login?error=auth");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    recordFailure(ip);
    redirect("/login?error=auth");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    recordFailure(ip);
    redirect("/login?error=auth");
  }

  const [profile] = await getDb()
    .select({
      rol: usuarios.rol,
      superAdmin: usuarios.superAdmin,
      activo: usuarios.activo,
      negocioEstado: negocios.estado,
      mustChangePassword: usuarios.mustChangePassword,
    })
    .from(usuarios)
    .leftJoin(negocios, eq(usuarios.negocioId, negocios.id))
    .where(eq(usuarios.id, user.id))
    .limit(1);

  const role = getRoleFromClaims(user.app_metadata) ?? getRoleFromClaims(user.user_metadata) ?? (profile?.superAdmin ? "super_admin" : profile?.rol);
  if (!role || !profile) {
    recordFailure(ip);
    redirect("/login?error=profile");
  }

  const negocioActivo = role === "super_admin" || !profile.negocioEstado || profile.negocioEstado === "activo";
  if (!profile.activo || !negocioActivo) {
    recordFailure(ip);
    redirect("/login?error=inactive");
  }

  clearFailures(ip);

  if (profile.mustChangePassword) redirect("/cambiar-clave");

  redirect(safeNext || roleHome[role]);
}
