import type { UserRole } from "@/lib/auth/roles";

export const demoCreds = {
  email: "admin@operux.local",
  password: "Operux2026!",
  role: "admin" as UserRole,
};

export const demoUsers = [
  {
    email: "superadmin@operux.local",
    password: "Operux2026!",
    role: "super_admin" as UserRole,
    nombre: "Super Admin MRZ",
  },
  {
    email: "admin@operux.local",
    password: "Operux2026!",
    role: "admin" as UserRole,
    nombre: "Admin Smart Style",
  },
  {
    email: "empleado@operux.local",
    password: "Operux2026!",
    role: "empleado" as UserRole,
    nombre: "Mateo Barber",
  },
  {
    email: "cliente@operux.local",
    password: "Operux2026!",
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
  return process.env.OPERUX_DEMO_MODE === "true";
}
