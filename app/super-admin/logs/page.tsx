import { getActivityLogs } from "@/lib/super-admin/queries";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/demo-server";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };

async function getRecentAccesses() {
  if (await isDemoMode()) return [];
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.auth.admin.listUsers({ perPage: 20, page: 1 });
    return (data?.users ?? [])
      .filter((u) => u.last_sign_in_at)
      .sort((a, b) => new Date(b.last_sign_in_at!).getTime() - new Date(a.last_sign_in_at!).getTime())
      .slice(0, 10)
      .map((u) => ({
        email: u.email ?? "—",
        lastSignIn: u.last_sign_in_at!,
        id: u.id,
      }));
  } catch { return []; }
}

function fmtDate(d: Date | string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(d));
}

export default async function LogsPage({ searchParams }: PageProps) {
  const page = Math.max(1, Number(searchParams?.page ?? 1));
  const [{ rows, total, limit }, recentAccesses] = await Promise.all([
    getActivityLogs(page, 50),
    getRecentAccesses(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-card bg-ds-surface p-5 shadow-ds-sm sm:p-8">
        <div className="relative">
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-ds-primary sm:mt-8">MRZLABS · Auditoría</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">Logs de actividad</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ds-fg-muted">
            Eventos registrados de todos los comercios. {total} registros en total.
          </p>
        </div>
      </section>

      {/* ── Últimos accesos ── */}
      {recentAccesses.length > 0 && (
        <div className="overflow-hidden rounded-card border" style={{ background: "var(--ds-surface)", borderColor: "var(--ds-border)" }}>
          <div className="border-b px-5 py-4" style={{ borderColor: "var(--ds-border)" }}>
            <h3 className="font-semibold text-ds-fg">Últimos accesos</h3>
            <p className="text-xs text-ds-fg-muted">Obtenido desde Supabase Auth</p>
          </div>
          <div className="overflow-x-auto scrollbar-soft">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="text-[10px] uppercase tracking-wide" style={{ background: "var(--ds-surface-2)", color: "var(--ds-fg-muted)" }}>
                <tr><th className="px-5 py-3">Email</th><th className="px-5 py-3">Último acceso</th></tr>
              </thead>
              <tbody>
                {recentAccesses.map((u, i) => (
                  <tr key={u.id} className="border-t" style={{ borderColor: "rgba(255,255,255,0.05)", background: i % 2 !== 0 ? "rgba(255,255,255,0.022)" : "transparent" }}>
                    <td className="px-5 py-3 text-ds-fg-muted">{u.email}</td>
                    <td className="px-5 py-3 font-mono text-xs text-ds-fg-muted">{fmtDate(u.lastSignIn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div
        className="overflow-hidden rounded-card border"
        style={{ background: "var(--ds-surface)", borderColor: "var(--ds-border)" }}
      >
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "var(--ds-border)" }}
        >
          <div>
            <h3 className="font-semibold text-ds-fg">Eventos del sistema</h3>
            <p className="text-xs text-ds-fg-muted">Página {page} de {totalPages} · {rows.length} registros</p>
          </div>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <a
                href={`?page=${page - 1}`}
                className="rounded-lg px-3 py-1.5 text-xs font-bold text-ds-fg transition hover:text-ds-fg"
                style={{ background: "var(--ds-surface-2)" }}
              >
                ← Anterior
              </a>
            )}
            {page < totalPages && (
              <a
                href={`?page=${page + 1}`}
                className="rounded-lg px-3 py-1.5 text-xs font-bold text-ds-fg transition hover:text-ds-fg"
                style={{ background: "var(--ds-surface-2)" }}
              >
                Siguiente →
              </a>
            )}
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-ds-fg-subtle">Sin eventos registrados aún.</p>
            <p className="mt-2 text-xs text-ds-fg-subtle">Los eventos se registran al operar el CRM.</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-soft">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead
                className="text-[10px] uppercase tracking-wide"
                style={{ background: "var(--ds-surface-2)", color: "var(--ds-fg-muted)" }}
              >
                <tr>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Comercio</th>
                  <th className="px-5 py-3">Usuario</th>
                  <th className="px-5 py-3">Acción</th>
                  <th className="px-5 py-3">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    className="border-t transition"
                    key={row.id}
                    style={{
                      borderColor: "rgba(255,255,255,0.05)",
                      background: i % 2 !== 0 ? "rgba(255,255,255,0.022)" : "transparent",
                    }}
                  >
                    <td className="px-5 py-3 font-mono text-xs text-ds-fg-muted">{fmtDate(row.createdAt)}</td>
                    <td className="px-5 py-3 text-ds-fg">{row.negocioNombre ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className="text-ds-fg">{row.usuarioNombre ?? "—"}</span>
                      {row.usuarioEmail && (
                        <span className="ml-1.5 text-xs text-ds-fg-subtle">{row.usuarioEmail}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                        style={{ background: "var(--ds-primary-tint)", color: "var(--ds-primary)" }}
                      >
                        {row.accion}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-ds-fg-subtle">
                      {row.detalle ? JSON.stringify(row.detalle).slice(0, 80) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
