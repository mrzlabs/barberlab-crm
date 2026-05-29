import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth/session";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/agenda", label: "Agenda" },
  { href: "/admin/turnos", label: "Turnos" },
  { href: "/admin/gastos", label: "Gastos" },
  { href: "/admin/inventario", label: "Inventario" },
  { href: "/admin/servicios", label: "Servicios" },
  { href: "/admin/empleados", label: "Empleados" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/reportes", label: "Reportes" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["admin"]);
  return <AppShell role="admin" title="Administracion" nav={nav}>{children}</AppShell>;
}
