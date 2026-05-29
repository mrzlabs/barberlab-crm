import type { UserRole } from "@/lib/auth/roles";

export const demoCreds = {
  email: "admin@barberlab.local",
  password: "BarberLab2026!",
  role: "admin" as UserRole,
};

export function isDemoMode() {
  return process.env.BARBERLAB_DEMO_MODE === "true";
}
