import { cookies } from "next/headers";
import type { UserRole } from "@/lib/auth/roles";
import {
  createDemoToken,
  DEMO_COOKIE,
  DEMO_TTL_SECONDS,
  getDemoRoleFromToken,
} from "@/lib/demo";

export async function getDemoRole() {
  return getDemoRoleFromToken(cookies().get(DEMO_COOKIE)?.value);
}

export async function isDemoMode() {
  return Boolean(await getDemoRole());
}

export async function setDemoSession(role: UserRole) {
  const token = await createDemoToken(role);
  cookies().set(DEMO_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: DEMO_TTL_SECONDS,
    path: "/",
  });
  cookies().delete("barberlab_demo_role");
}

export function clearDemoSession() {
  cookies().delete(DEMO_COOKIE);
  cookies().delete("barberlab_demo_role");
}
