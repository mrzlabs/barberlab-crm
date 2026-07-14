import { getNegocios } from "@/lib/super-admin/queries";
import { NegocioCreateForm } from "./NegocioCreateForm";
import { NegociosManager } from "./NegociosManager";

export const dynamic = "force-dynamic";

export default async function NegociosPage() {
  const negocios = await getNegocios();
  const activos     = negocios.filter((n) => n.estado === "activo").length;
  const suspendidos = negocios.filter((n) => n.estado === "suspendido").length;
  const dedicados   = negocios.filter((n) => n.modoAislamiento === "dedicado").length;
  const mrrBase     = negocios.reduce((sum, n) => {
    if (n.estado !== "activo") return sum;
    if (n.plan === "enterprise") return sum + 450_000;
    if (n.plan === "pro")        return sum + 180_000;
    return sum + 90_000;
  }, 0);

  return (
    <div className="space-y-6">

      {/* ── Hero SaaS ─── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl shadow-violet-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,.32),transparent_18rem),radial-gradient(circle_at_86%_65%,rgba(168,85,247,.36),transparent_20rem)]" />
        <div className="relative">
          <div className="mac-dots" />
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300 sm:mt-8">MRZLABS · SaaS Control Panel</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">Panel de negocios registrados</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Crea barberias, define plan, personaliza identidad visual, administra usuarios y controla suscripción desde un solo panel.
          </p>
        </div>
      </section>

      {/* ── KPIs SaaS ─── */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {[
          { label: "Negocios totales", value: negocios.length,                                    accent: "border-l-4 border-l-violet-400" },
          { label: "Activos",          value: activos,                                             accent: "border-l-4 border-l-emerald-400" },
          { label: "Suspendidos",      value: suspendidos,                                         accent: "border-l-4 border-l-amber-400" },
          { label: "MRR base",         value: `$${mrrBase.toLocaleString("es-CO")}`,              accent: "border-l-4 border-l-cyan-400" },
        ].map((kpi) => (
          <article
            className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${kpi.accent}`}
            key={kpi.label}
            style={{ background: "#1a1a2e", borderColor: "rgba(255,255,255,0.1)" }}
          >
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{kpi.label}</p>
            <strong className="mt-2 block truncate text-xl font-black text-white sm:text-2xl">{kpi.value}</strong>
          </article>
        ))}
      </section>

      {/* ── Capacidades SaaS ─── */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { tag: "LATAM",       body: `${negocios.length} negocios preparados para operar por país, moneda y plan.`,         color: "text-cyan-400"    },
          { tag: "Suspendidos", body: `${suspendidos} requieren revisión comercial, pago o retiro controlado.`,              color: "text-amber-400"   },
          { tag: "Dedicado",    body: `${dedicados} clientes con perfil enterprise o datos separados.`,                      color: "text-violet-400"  },
          { tag: "Acciones",    body: "Crear usuarios, personalizar marca, cambiar plan y retirar tienda por negocio.",       color: "text-emerald-400" },
        ].map((c) => (
          <article
            className="rounded-2xl border p-4"
            key={c.tag}
            style={{ background: "#1a1a2e", borderColor: "rgba(255,255,255,0.1)" }}
          >
            <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${c.color}`}>{c.tag}</p>
            <p className="mt-2 text-sm leading-5 text-slate-300">{c.body}</p>
          </article>
        ))}
      </section>

      {/* ── Formulario + Tabla ─── */}
      <section className="grid gap-6 xl:grid-cols-[400px_1fr]">

        {/* form crear negocio */}
        <NegocioCreateForm />

        {/* tabla clientes — Client Component con drawer "Operar" */}
        <NegociosManager negocios={negocios} />

      </section>
    </div>
  );
}
