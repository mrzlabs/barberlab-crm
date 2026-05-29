import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth/session";

const nav = [
  { href: "/empleado/mi-agenda", label: "Mi agenda" },
  { href: "/empleado/cerrar-turno", label: "Cerrar turno" },
];

export default async function EmpleadoLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["empleado"]);
  return <AppShell role="empleado" title="Empleado" nav={nav}>{children}</AppShell>;
}
