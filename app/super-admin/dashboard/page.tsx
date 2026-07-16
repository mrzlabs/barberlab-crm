import Link from "next/link";
import { getNegocios, getRenewalRequests } from "@/lib/super-admin/queries";
import { OperarButton } from "@/components/super-admin/OperarButton";
import { fmtMoney } from "@/lib/admin/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stat } from "@/components/ui/Stat";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

const planTone: Record<string, "neutral" | "primary" | "success"> = { starter: "neutral", pro: "primary", enterprise: "success" };
const estadoTone: Record<string, "success" | "warning" | "danger"> = { activo: "success", suspendido: "warning", cancelado: "danger" };

function calcMRR(plan: string, estado: string) {
  if (estado !== "activo") return 0;
  if (plan === "enterprise") return 450_000;
  if (plan === "pro")        return 180_000;
  return 90_000;
}

export default async function SuperAdminDashboardPage() {
  const [negocios, renewalRequests] = await Promise.all([getNegocios(), getRenewalRequests()]);
  const activos     = negocios.filter((n) => n.estado === "activo").length;
  const suspendidos = negocios.filter((n) => n.estado === "suspendido").length;
  const mrr         = negocios.reduce((s, n) => s + calcMRR(n.plan, n.estado), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard operativo"
        description="Vista consolidada de todos los comercios. Entra a operar cualquier negocio sin cerrar sesión."
      />

      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Stat label="Total negocios" value={negocios.length} />
        <Stat label="Activos" value={activos} />
        <Stat label="Suspendidos" value={suspendidos} />
        <Stat label="MRR base" value={fmtMoney(mrr)} detail="Estimado por plan activo" />
      </section>

      {renewalRequests.length > 0 && (
        <section className="rounded-card border border-ds-warning/30 bg-ds-warning-tint p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wide text-ds-warning">Alertas de renovación</p>
              <h3 className="text-base font-semibold text-ds-fg">Solicitudes pendientes de actualización</h3>
            </div>
            <Badge tone="warning">{renewalRequests.length} recientes</Badge>
          </div>
          <div className="mt-4 grid gap-3">
            {renewalRequests.map((item) => {
              const detail = (item.detalle ?? {}) as Record<string, unknown>;
              const negocioNombre = item.negocioNombre || String(detail.negocioNombre || "Negocio sin nombre");
              return (
                <article className="grid gap-3 rounded-control border border-ds-border bg-ds-surface p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={item.id}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ds-fg">{negocioNombre}</p>
                    <p className="mt-1 truncate text-[12px] text-ds-fg-muted">
                      Solicitado por {item.usuarioNombre || String(detail.usuarioNombre || "usuario")} · {item.usuarioEmail || String(detail.email || "sin email")}
                    </p>
                    <p className="mt-1 text-[12px] text-ds-warning">
                      Plan {String(detail.plan || "sin plan")} · Renovación actual {String(detail.fechaFin || "sin fecha")}
                    </p>
                  </div>
                  {item.negocioId && (
                    <Link className="inline-flex h-control items-center justify-center rounded-control bg-ds-warning px-4 text-[13px] font-medium text-white transition hover:brightness-95" href={`/super-admin/negocios/${item.negocioId}`}>
                      Actualizar
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {negocios.map((n) => (
          <article key={n.id} className="flex flex-col justify-between rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="grid size-10 shrink-0 place-items-center rounded-control text-sm font-semibold text-white" style={{ background: n.colorPrimario }}>
                  {n.nombre.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex gap-1.5">
                  <Badge tone={planTone[n.plan] ?? "neutral"}><span className="capitalize">{n.plan}</span></Badge>
                  <Badge tone={estadoTone[n.estado] ?? "neutral"}><span className="capitalize">{n.estado}</span></Badge>
                </div>
              </div>
              <h3 className="mt-3 text-[15px] font-semibold text-ds-fg">{n.nombre}</h3>
              <p className="mt-0.5 font-mono text-[12px] text-ds-fg-subtle">{n.slug}</p>
              <div className="mt-3 flex gap-1.5">
                {[n.colorPrimario, n.colorSecundario, n.colorAcento].map((c) => (
                  <span key={c} className="size-4 rounded-full border border-ds-border" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Link href={`/super-admin/negocios/${n.id}`} className="flex-1 rounded-control border border-ds-border bg-ds-surface px-3 py-2 text-center text-[12px] font-medium text-ds-fg-muted transition-colors hover:bg-ds-surface-2 hover:text-ds-fg">
                Gestionar
              </Link>
              <OperarButton negocioId={n.id} nombre={n.nombre} />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
