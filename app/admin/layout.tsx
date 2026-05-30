import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SubmitToast } from "@/components/layout/SubmitToast";
import { requireRole } from "@/lib/auth/session";
import { getAlerts } from "@/lib/admin/queries";

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
  { href: "/admin/configuracion", label: "Configuracion" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["admin", "super_admin"]);
  const alerts = profile.negocioId ? await getAlerts(profile.negocioId) : [];
  return (
    <>
      <AppShell alerts={alerts} profile={profile} role="admin" title={profile.negocioNombre || "Administracion"} nav={nav}>{children}</AppShell>
      <Suspense>
        <SubmitToast />
      </Suspense>
    </>
  );
}
