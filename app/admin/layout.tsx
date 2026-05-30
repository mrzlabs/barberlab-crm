import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { SubmitToast } from "@/components/layout/SubmitToast";
import { getCurrentProfile } from "@/lib/auth/session";
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
  // getCurrentProfile retorna null sin redirect — el middleware ya protege /admin/*.
  // Si lanza durante un RSC fetch (token refresh race), el catch evita el 307 loop.
  const profile = await getCurrentProfile().catch(() => null);

  if (!profile || !["admin", "super_admin"].includes(profile.rol)) {
    // Sesión inválida en RSC fetch: renderiza children sin shell.
    // El middleware redirige a /login en la siguiente navegación completa.
    return <>{children}</>;
  }

  const alerts = profile.negocioId
    ? await getAlerts(profile.negocioId).catch(() => [])
    : [];

  return (
    <>
      <AppShell alerts={alerts} profile={profile} role="admin" title={profile.negocioNombre || "Administracion"} nav={nav}>
        {children}
      </AppShell>
      <Suspense>
        <SubmitToast />
      </Suspense>
    </>
  );
}
