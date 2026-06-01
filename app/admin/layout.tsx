import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { AppShell } from "@/components/layout/AppShell";
import { SubmitToast } from "@/components/layout/SubmitToast";
import { getCurrentProfile } from "@/lib/auth/session";
import { getAlerts } from "@/lib/admin/queries";
import { getDb } from "@/lib/db";
import { negocios } from "@/lib/db/schema";

const nav = [
  { href: "/admin/dashboard",      label: "Dashboard"      },
  { href: "/admin/agenda",         label: "Agenda"         },
  { href: "/admin/turnos",         label: "Turnos"         },
  { href: "/admin/gastos",         label: "Gastos"         },
  { href: "/admin/inventario",     label: "Inventario"     },
  { href: "/admin/servicios",      label: "Servicios"      },
  { href: "/admin/empleados",      label: "Empleados"      },
  { href: "/admin/clientes",       label: "Clientes"       },
  { href: "/admin/reportes",       label: "Reportes"       },
  { href: "/admin/configuracion",  label: "Configuracion"  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile().catch(() => null);

  if (!profile || !["admin", "super_admin"].includes(profile.rol)) {
    return <>{children}</>;
  }

  // Defense-in-depth: block access if negocio is suspended/cancelled
  if (profile.negocioEstado && profile.negocioEstado !== "activo" && profile.rol !== "super_admin") {
    redirect("/login?error=negocio_inactivo");
  }

  const isImpersonating = !!cookies().get("barberlab_sa_imp")?.value;

  const [alerts, configRow] = await Promise.all([
    profile.negocioId ? getAlerts(profile.negocioId).catch(() => []) : Promise.resolve([]),
    profile.negocioId
      ? getDb()
          .select({ configVisual: negocios.configVisual })
          .from(negocios)
          .where(eq(negocios.id, profile.negocioId))
          .limit(1)
          .catch(() => [])
      : Promise.resolve([]),
  ]);

  const configVisual = configRow[0]?.configVisual ?? null;

  return (
    <>
      <AppShell
        alerts={alerts}
        configVisual={configVisual}
        isImpersonating={isImpersonating}
        profile={profile}
        role="admin"
        title={profile.negocioNombre || "Administracion"}
        nav={nav}
      >
        {children}
      </AppShell>
      <Suspense>
        <SubmitToast />
      </Suspense>
    </>
  );
}
