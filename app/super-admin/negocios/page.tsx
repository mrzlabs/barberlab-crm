import { getNegocios } from "@/lib/super-admin/queries";
import { createNegocio } from "./actions";
import { NegociosManager } from "./NegociosManager";

export const dynamic = "force-dynamic";

const input =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/40 transition";

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
        <form
          action={createNegocio}
          className="rounded-[2rem] border p-5"
          style={{ background: "#111118", borderColor: "rgba(255,255,255,0.09)" }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">Nuevo cliente SaaS</p>
          <h3 className="mt-1 text-xl font-black text-white">Registrar barbería</h3>
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
            <div
              className="rounded-xl border p-3"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Identidad visual</p>
              <div className="grid grid-cols-3 gap-2">
                <label className="grid gap-1 text-[10px] font-semibold text-slate-400">
                  Principal<input className="h-9 w-full rounded-lg border border-white/10 bg-transparent" defaultValue="#111827" name="colorPrimario" type="color" />
                </label>
                <label className="grid gap-1 text-[10px] font-semibold text-slate-400">
                  Secundario<input className="h-9 w-full rounded-lg border border-white/10 bg-transparent" defaultValue="#22d3ee" name="colorSecundario" type="color" />
                </label>
                <label className="grid gap-1 text-[10px] font-semibold text-slate-400">
                  Acento<input className="h-9 w-full rounded-lg border border-white/10 bg-transparent" defaultValue="#7c3aed" name="colorAcento" type="color" />
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

            <div
              className="rounded-xl border p-3"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Regla contable</p>
              <select className={input} name="comisionBase" defaultValue="precio_final">
                <option value="precio_final">Comisión sobre precio final</option>
                <option value="precio_menos_descuento">Comisión sobre precio menos descuento</option>
                <option value="precio_menos_insumo">Comisión sobre precio menos insumo</option>
              </select>
              <label className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-400">
                <input name="propinaEnComision" type="hidden" value="false" />
                <input className="size-4 accent-violet-500" name="propinaEnComision" type="checkbox" value="true" />
                Incluir propina en comisión
              </label>
            </div>

            <input className={input} name="fechaFin" placeholder="Fecha renovación" type="date" />

            {/* admin */}
            <div
              className="rounded-xl border p-3"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
            >
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Admin del negocio</p>
              <div className="grid gap-2">
                <input className={input} name="adminNombre" placeholder="Nombre admin" required />
                <input className={input} name="adminTelefono" placeholder="Teléfono admin" required />
                <input className={input} name="adminEmail" placeholder="Email admin" required type="email" />
                <input className={input} name="adminPassword" placeholder="Password inicial" required type="password" />
              </div>
            </div>

            <button
              className="rounded-xl px-4 py-3 text-sm font-black text-white transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#22d3ee,#7c3aed)" }}
              type="submit"
            >
              Crear negocio
            </button>
          </div>
        </form>

        {/* tabla clientes — Client Component con drawer "Operar" */}
        <NegociosManager negocios={negocios} />

      </section>
    </div>
  );
}
