import type { UserRole } from "@/lib/auth/roles";

export const demoCreds = {
  email: "admin@barberlab.local",
  password: "BarberLab2026!",
  role: "admin" as UserRole,
};

export const demoUsers = [
  {
    email: "superadmin@barberlab.local",
    password: "BarberLab2026!",
    role: "super_admin" as UserRole,
    nombre: "Super Admin MRZ",
  },
  {
    email: "admin@barberlab.local",
    password: "BarberLab2026!",
    role: "admin" as UserRole,
    nombre: "Admin Smart Style",
  },
  {
    email: "empleado@barberlab.local",
    password: "BarberLab2026!",
    role: "empleado" as UserRole,
    nombre: "Mateo Barber",
  },
  {
    email: "cliente@barberlab.local",
    password: "BarberLab2026!",
    role: "cliente" as UserRole,
    nombre: "Laura Cliente",
  },
];

export function getDemoUser(email?: string | null, password?: string | null) {
  return demoUsers.find((user) => user.email === email && user.password === password) ?? null;
}

export function getDemoUserByRole(role?: string | null) {
  return demoUsers.find((user) => user.role === role) ?? null;
}

export function isDemoMode() {
  return process.env.BARBERLAB_DEMO_MODE === "true";
}
