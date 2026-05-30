import { getNegocios } from "@/lib/super-admin/queries";
import { createNegocio } from "./actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition";

const planBadge: Record<string, string> = {
  starter:    "bg-slate-100 text-slate-700",
  pro:        "bg-violet-100 text-violet-700",
  enterprise: "bg-emerald-100 text-emerald-700",
};
const estadoBadge: Record<string, string> = {
  activo:     "bg-emerald-100 text-emerald-700",
  suspendido: "bg-amber-100 text-amber-700",
  cancelado:  "bg-rose-100 text-rose-700",
};

function PlanBadge({ plan }: { plan: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${planBadge[plan] ?? "bg-slate-100 text-slate-600"}`}>
      {plan}
    </span>
  );
}
function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${estadoBadge[estado] ?? "bg-slate-100 text-slate-600"}`}>
      {estado}
    </span>
  );
}

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
          { label: "Negocios totales",    value: negocios.length,  accent: "border-l-4 border-l-violet-400" },
          { label: "Activos",             value: activos,           accent: "border-l-4 border-l-emerald-400" },
          { label: "Suspendidos",         value: suspendidos,       accent: "border-l-4 border-l-amber-400" },
          { label: "MRR base",            value: `$${mrrBase.toLocaleString("es-CO")}`, accent: "border-l-4 border-l-cyan-400" },
        ].map((kpi) => (
          <article className={`min-w-0 rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${kpi.accent}`} key={kpi.label}>
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{kpi.label}</p>
            <strong className="mt-2 block truncate text-xl font-black sm:text-2xl">{kpi.value}</strong>
          </article>
        ))}
      </section>

      {/* ── Capacidades SaaS ─── */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { tag: "LATAM",       body: `${negocios.length} negocios preparados para operar por país, moneda y plan.`,          color: "text-cyan-600" },
          { tag: "Suspendidos", body: `${suspendidos} requieren revisión comercial, pago o retiro controlado.`,               color: "text-amber-600" },
          { tag: "Dedicado",    body: `${dedicados} clientes con perfil enterprise o datos separados.`,                       color: "text-violet-600" },
          { tag: "Acciones",    body: "Crear usuarios, personalizar marca, cambiar plan y retirar tienda por negocio.",        color: "text-emerald-600" },
        ].map((c) => (
          <article className="rounded-2xl border bg-white p-4 shadow-sm" key={c.tag}>
            <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${c.color}`}>{c.tag}</p>
            <p className="mt-2 text-sm leading-5 text-slate-600">{c.body}</p>
          </article>
        ))}
      </section>

      {/* ── Formulario + Tabla ─── */}
      <section className="grid gap-6 xl:grid-cols-[400px_1fr]">

        {/* form crear negocio */}
        <form action={createNegocio} className="glass-panel rounded-[2rem] p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">Nuevo cliente SaaS</p>
          <h3 className="mt-1 text-xl font-black">Registrar barbería</h3>
          <div className="mt-4 grid gap-3">
            <input className={input} name="nombre" placeholder="Nombre barbería" required />
            <input className={input} name="slug" placeholder="slug-barberia" required />
            <div className="grid grid-cols-2 gap-3">
              <input className={input} name="telefono" placeholder="Teléfono" />
              <input className={input} name="correo" placeholder="Correo" type="email" />
            </div>
            <input className={input} name="direccion" placeholder="Dirección" />
            <input className={input} name="representante" placeholder="Representante legal" />
            <div className="grid grid-cols-2 gap-3">
              <select className={input} name="tipoDocumento" defaultValue="cc">
                <option value="cc">Cédula ciudadanía</option>
                <option value="ce">Cédula extranjería</option>
                <option value="nit">NIT</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="pep">PEP</option>
                <option value="ppt">PPT</option>
                <option value="ti">Tarjeta identidad</option>
              </select>
              <input className={input} name="numeroDocumento" placeholder="Número documento" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className={input} name="ciudadIndicativo" placeholder="Indicativo ciudad" />
              <input className={input} name="contactoPrincipal" placeholder="Contacto principal" />
            </div>
            <textarea className={input} name="descripcion" placeholder="Descripción de la barbería" rows={3} />
            <input className={input} name="slogan" placeholder="Slogan dashboard" />
            <input className={input} name="logoUrl" placeholder="URL logo" />

            {/* colores */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">Identidad visual</p>
              <div className="grid grid-cols-3 gap-2">
                <label className="grid gap-1 text-[10px] font-semibold text-slate-500">
                  Principal<input className="h-9 w-full rounded-lg border" defaultValue="#111827" name="colorPrimario" type="color" />
                </label>
                <label className="grid gap-1 text-[10px] font-semibold text-slate-500">
                  Secundario<input className="h-9 w-full rounded-lg border" defaultValue="#22d3ee" name="colorSecundario" type="color" />
                </label>
                <label className="grid gap-1 text-[10px] font-semibold text-slate-500">
                  Acento<input className="h-9 w-full rounded-lg border" defaultValue="#7c3aed" name="colorAcento" type="color" />
                </label>
              </div>
              <input className={`${input} mt-2`} defaultValue="Outfit" name="fuente" placeholder="Fuente" />
            </div>

            {/* plan / estado / aislamiento */}
            <div className="grid grid-cols-3 gap-2">
              <select className={input} name="plan" defaultValue="pro">
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <select className={input} name="estado" defaultValue="activo">
                <option value="activo">Activo</option>
                <option value="suspendido">Suspendido</option>
                <option value="cancelado">Cancelado</option>
              </select>
              <select className={input} name="modoAislamiento" defaultValue="multi_tenant">
                <option value="multi_tenant">Multi</option>
                <option value="dedicado">Dedicado</option>
              </select>
            </div>
            <input className={input} name="fechaFin" placeholder="Fecha renovación" type="date" />

            {/* admin */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">Admin del negocio</p>
              <div className="grid gap-2">
                <input className={input} name="adminNombre" placeholder="Nombre admin" required />
                <input className={input} name="adminTelefono" placeholder="Teléfono admin" required />
                <input className={input} name="adminEmail" placeholder="Email admin" required type="email" />
                <input className={input} name="adminPassword" placeholder="Password inicial" required type="password" />
              </div>
            </div>

            <button className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white hover:bg-violet-950 transition" type="submit">
              Crear negocio
            </button>
          </div>
        </form>

        {/* tabla clientes registrados */}
        <div className="glass-panel overflow-hidden rounded-[2rem]">
          <div className="flex items-center justify-between border-b border-slate-200/60 px-5 py-4">
            <div>
              <h3 className="font-black">Clientes registrados</h3>
              <p className="text-xs text-slate-500">Modelo híbrido: multi-tenant por defecto, dedicado para enterprise.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">{negocios.length} negocios</span>
          </div>
          <div className="overflow-x-auto scrollbar-soft">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-950 text-[10px] uppercase tracking-wide text-cyan-100">
                <tr>
                  <th className="px-5 py-3">Negocio</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Modo</th>
                  <th className="px-4 py-3">Marca</th>
                  <th className="px-4 py-3">Acción</th>
                </tr>
              </thead>
              <tbody>
                {negocios.map((n, i) => (
                  <tr className={`border-t transition hover:bg-violet-50/30 ${i % 2 === 0 ? "" : "bg-slate-50/40"}`} key={n.id}>
                    <td className="px-5 py-3.5 font-semibold">{n.nombre}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{n.slug}</td>
                    <td className="px-4 py-3.5"><PlanBadge plan={n.plan} /></td>
                    <td className="px-4 py-3.5"><EstadoBadge estado={n.estado} /></td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {n.modoAislamiento === "dedicado"
                        ? <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">Dedicado</span>
                        : <span className="text-slate-400">Multi</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        {[n.colorPrimario, n.colorSecundario, n.colorAcento].map((c) => (
                          <span className="size-4 rounded-full border border-white shadow-sm" key={c} style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link className="rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-800 transition" href={`/super-admin/negocios/${n.id}`}>
                        Gestionar
                      </Link>
                    </td>
                  </tr>
                ))}
                {negocios.length === 0 && (
                  <tr><td className="px-5 py-8 text-center text-slate-400" colSpan={7}>Sin negocios registrados aún.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
