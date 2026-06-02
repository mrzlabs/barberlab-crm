import { getNegocios, getRenewalRequests } from "@/lib/super-admin/queries";
import { OperarButton } from "@/components/super-admin/OperarButton";
import { fmtMoney } from "@/lib/admin/format";

export const dynamic = "force-dynamic";

const planBadge: Record<string, string> = {
  starter:    "bg-slate-700/60 text-slate-300",
  pro:        "bg-violet-900/50 text-violet-300",
  enterprise: "bg-emerald-900/50 text-emerald-300",
};
const estadoBadge: Record<string, string> = {
  activo:     "bg-emerald-900/50 text-emerald-300",
  suspendido: "bg-amber-900/50 text-amber-300",
  cancelado:  "bg-rose-900/50 text-rose-300",
};

function calcMRR(plan: string, estado: string) {
  if (estado !== "activo") return 0;
  if (plan === "enterprise") return 450_000;
  if (plan === "pro")        return 180_000;
  return 90_000;
}

export default async function SuperAdminDashboardPage() {
  const [negocios, renewalRequests] = await Promise.all([
    getNegocios(),
    getRenewalRequests(),
  ]);
  const activos     = negocios.filter((n) => n.estado === "activo").length;
  const suspendidos = negocios.filter((n) => n.estado === "suspendido").length;
  const mrr         = negocios.reduce((s, n) => s + calcMRR(n.plan, n.estado), 0);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,.28),transparent_16rem),radial-gradient(circle_at_85%_70%,rgba(168,85,247,.28),transparent_18rem)]" />
        <div className="relative">
          <div className="mac-dots" />
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300 sm:mt-8">MRZLABS · Control SaaS</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">Dashboard operativo</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Vista consolidada de todos los comercios. Entra a operar cualquier negocio sin cerrar sesión.
          </p>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {[
          { label: "Total negocios", value: negocios.length, accent: "border-l-violet-400" },
          { label: "Activos",        value: activos,          accent: "border-l-emerald-400" },
          { label: "Suspendidos",    value: suspendidos,      accent: "border-l-amber-400" },
          { label: "MRR base",       value: fmtMoney(mrr),    accent: "border-l-cyan-400" },
        ].map((k) => (
          <article
            key={k.label}
            className={`min-w-0 rounded-2xl border border-l-4 p-4 sm:p-5 ${k.accent}`}
            style={{ background: "#1a1a2e", borderColor: "rgba(255,255,255,0.1)" }}
          >
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{k.label}</p>
            <strong className="mt-2 block truncate text-xl font-black text-white sm:text-2xl">{k.value}</strong>
          </article>
        ))}
      </section>

      {renewalRequests.length > 0 && (
        <section className="rounded-[1.6rem] border border-amber-400/30 bg-amber-500/10 p-5 shadow-xl shadow-amber-950/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-300">Alertas de renovación</p>
              <h3 className="mt-1 text-xl font-black text-white">Solicitudes pendientes de actualización</h3>
            </div>
            <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-black text-amber-200">
              {renewalRequests.length} recientes
            </span>
          </div>
          <div className="mt-4 grid gap-3">
            {renewalRequests.map((item) => {
              const detail = (item.detalle ?? {}) as Record<string, unknown>;
              const negocioNombre = item.negocioNombre || String(detail.negocioNombre || "Negocio sin nombre");
              return (
                <article className="grid gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4 sm:grid-cols-[1fr_auto] sm:items-center" key={item.id}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">{negocioNombre}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      Solicitado por {item.usuarioNombre || String(detail.usuarioNombre || "usuario")} · {item.usuarioEmail || String(detail.email || "sin email")}
                    </p>
                    <p className="mt-1 text-xs text-amber-200">
                      Plan {String(detail.plan || "sin plan")} · Renovación actual {String(detail.fechaFin || "sin fecha")}
                    </p>
                  </div>
                  {item.negocioId && (
                    <a
                      className="rounded-xl bg-amber-300 px-4 py-2 text-center text-xs font-black text-slate-950 transition hover:bg-amber-200"
                      href={`/super-admin/negocios/${item.negocioId}`}
                    >
                      Actualizar
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Negocios grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {negocios.map((n) => (
          <article
            key={n.id}
            className="flex flex-col justify-between rounded-[1.6rem] border p-5 transition"
            style={{ background: "rgba(17,17,24,0.95)", borderColor: "rgba(255,255,255,0.09)" }}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div
                  className="grid size-10 shrink-0 place-items-center rounded-2xl text-sm font-black text-white shadow"
                  style={{
                    background: `linear-gradient(135deg, ${n.colorPrimario}, ${n.colorAcento})`,
                  }}
                >
                  {n.nombre.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex gap-1.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${planBadge[n.plan] ?? ""}`}>
                    {n.plan}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${estadoBadge[n.estado] ?? ""}`}>
                    {n.estado}
                  </span>
                </div>
              </div>
              <h3 className="mt-3 text-base font-black text-white">{n.nombre}</h3>
              <p className="mt-0.5 font-mono text-xs text-slate-500">{n.slug}</p>
              <div className="mt-3 flex gap-1.5">
                {[n.colorPrimario, n.colorSecundario, n.colorAcento].map((c) => (
                  <span
                    key={c}
                    className="size-4 rounded-full border border-white/20"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <a
                href={`/super-admin/negocios/${n.id}`}
                className="flex-1 rounded-xl px-3 py-2 text-center text-xs font-bold text-white/80 transition hover:text-white"
                style={{ background: "rgba(255,255,255,0.07)" }}
              >
                Gestionar
              </a>
              <OperarButton negocioId={n.id} nombre={n.nombre} />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
