export const roles = ["admin", "empleado", "cliente"] as const;

export type UserRole = (typeof roles)[number];

export const roleHome: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  empleado: "/empleado/mi-agenda",
  cliente: "/cliente/reservar",
};

export const protectedPrefixes: Array<{ prefix: string; roles: UserRole[] }> = [
  { prefix: "/admin", roles: ["admin"] },
  { prefix: "/empleado", roles: ["empleado"] },
  { prefix: "/cliente", roles: ["cliente"] },
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
