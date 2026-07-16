import { eq } from "drizzle-orm";
import { AppShell } from "@/components/layout/AppShell";
import { requireRole } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { negocios } from "@/lib/db/schema";

const nav = [
  { href: "/empleado/mi-agenda", label: "Mi agenda" },
  { href: "/empleado/cerrar-turno", label: "Cerrar turno" },
  { href: "/empleado/reportes", label: "Reportes" },
];

export default async function EmpleadoLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["empleado"]);
  const configRow = profile.negocioId
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
