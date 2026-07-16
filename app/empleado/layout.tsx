import { eq } from "drizzle-orm";
import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { negocios } from "@/lib/db/schema";
import { isDemoMode } from "@/lib/demo-server";

const nav = [
  { href: "/empleado/mi-agenda", label: "Mi agenda" },
  { href: "/empleado/cerrar-turno", label: "Cerrar turno" },
  { href: "/empleado/reportes", label: "Reportes" },
];

export default async function EmpleadoLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["empleado"]);
  const demoMode = await isDemoMode();
  const configRow = profile.negocioId && !demoMode
    ? await getDb()
        .select({ configVisual: negocios.configVisual })
        .from(negocios)
        .where(eq(negocios.id, profile.negocioId))
        .limit(1)
        .catch(() => [])
    : [];

  return (
    <AppShell
      configVisual={configRow[0]?.configVisual ?? null}
      profile={profile}
      role="empleado"
      theme="light"
      title={profile.negocioNombre || "Empleado"}
      nav={nav}
    >
      {children}
    </AppShell>
  );
}
