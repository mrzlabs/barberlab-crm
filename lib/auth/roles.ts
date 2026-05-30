export const roles = ["super_admin", "admin", "empleado", "cliente"] as const;

export type UserRole = (typeof roles)[number];

export const roleHome: Record<UserRole, string> = {
  super_admin: "/super-admin/negocios",
  admin: "/admin/dashboard",
  empleado: "/empleado/mi-agenda",
  cliente: "/cliente/reservar",
};

export const protectedPrefixes: Array<{ prefix: string; roles: UserRole[] }> = [
  { prefix: "/super-admin", roles: ["super_admin"] },
  { prefix: "/admin", roles: ["admin", "super_admin"] },
  { prefix: "/empleado", roles: ["empleado"] },
  { prefix: "/cliente", roles: ["cliente"] },
  { prefix: "/perfil", roles: ["super_admin", "admin", "empleado", "cliente"] },
];

export function isRole(value: unknown): value is UserRole {
  return typeof value === "string" && roles.includes(value as UserRole);
}

export function getRoleFromClaims(claims: Record<string, unknown> | null | undefined): UserRole | null {
  const direct = claims?.rol;
  if (isRole(direct)) return direct;

  const role = claims?.role;
  if (isRole(role)) return role;

  const metadata = claims?.user_metadata;
  if (metadata && typeof metadata === "object" && "rol" in metadata) {
    const nested = (metadata as { rol?: unknown }).rol;
    if (isRole(nested)) return nested;
  }

  return null;
}
