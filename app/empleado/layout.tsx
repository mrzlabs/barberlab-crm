import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth/session";

const nav = [
  { href: "/empleado/mi-agenda", label: "Mi agenda" },
  { href: "/empleado/cerrar-turno", label: "Cerrar turno" },
];

export default async function EmpleadoLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["empleado"]);
  return <AppShell profile={profile} role="empleado" title={profile.negocioNombre || "Empleado"} nav={nav}>{children}</AppShell>;
}
