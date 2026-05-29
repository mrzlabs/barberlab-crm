import { getNegocios } from "@/lib/super-admin/queries";
import { createNegocio } from "./actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white/80 px-3 py-2 text-sm outline-none focus:border-cyan-500";

export default async function NegociosPage() {
  const negocios = await getNegocios();
  const activos = negocios.filter((negocio) => negocio.estado === "activo").length;
  const mrrBase = negocios.reduce((sum, negocio) => {
    if (negocio.estado !== "activo") return sum;
    if (negocio.plan === "enterprise") return sum + 450000;
    if (negocio.plan === "pro") return sum + 180000;
    return sum + 90000;
  }, 0);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-violet-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(34,211,238,.34),transparent_18rem),radial-gradient(circle_at_84%_65%,rgba(168,85,247,.38),transparent_20rem)]" />
        <div className="relative">
          <div className="mac-dots" />
          <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">MRZLABS SaaS Control</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Resumen operativo de negocios registrados.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
            Control central para crear barberias, definir plan, personalizar identidad visual y administrar suscripcion.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="glass-panel rounded-[1.4rem] p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Negocios</p>
          <strong className="mt-2 block text-3xl font-black">{negocios.length}</strong>
        </article>
        <article className="glass-panel rounded-[1.4rem] p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Activos</p>
          <strong className="mt-2 block text-3xl font-black">{activos}</strong>
        </article>
        <article className="glass-panel rounded-[1.4rem] p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">MRR base</p>
          <strong className="mt-2 block break-words text-3xl font-black">${mrrBase.toLocaleString("es-CO")}</strong>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[430px_1fr]">
        <form action={createNegocio} className="glass-panel rounded-[2rem] p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Nuevo cliente SaaS</p>
          <h3 className="mt-1 text-2xl font-black">Registrar barberia</h3>
          <div className="mt-5 grid gap-3">
            <input className={input} name="nombre" placeholder="Nombre barberia" required />
            <input className={input} name="slug" placeholder="slug-barberia" required />
            <input className={input} name="telefono" placeholder="Telefono" />
            <input className={input} name="direccion" placeholder="Direccion" />
            <input className={input} name="logoUrl" placeholder="URL logo" />
            <div className="grid grid-cols-3 gap-2">
              <input className={input} defaultValue="#111827" name="colorPrimario" type="color" />
              <input className={input} defaultValue="#22d3ee" name="colorSecundario" type="color" />
              <input className={input} defaultValue="#7c3aed" name="colorAcento" type="color" />
            </div>
            <input className={input} defaultValue="Inter" name="fuente" placeholder="Fuente" />
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
            <div className="mt-3 rounded-2xl border bg-white/70 p-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Admin negocio</p>
              <div className="mt-3 grid gap-2">
                <input className={input} name="adminNombre" placeholder="Nombre admin" required />
                <input className={input} name="adminTelefono" placeholder="Telefono admin" required />
                <input className={input} name="adminEmail" placeholder="Email admin" required type="email" />
                <input className={input} name="adminPassword" placeholder="Password inicial" required type="password" />
              </div>
            </div>
            <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white" type="submit">Crear negocio</button>
          </div>
        </form>

        <section className="glass-panel overflow-hidden rounded-[2rem]">
          <div className="border-b border-slate-200/70 p-5">
            <h3 className="text-2xl font-black">Clientes registrados</h3>
            <p className="mt-1 text-sm text-slate-500">Modelo hibrido: multi-tenant por defecto y dedicado para enterprise.</p>
          </div>
          <div className="overflow-x-auto scrollbar-soft">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-950 text-xs uppercase tracking-wide text-cyan-100">
                <tr>
                  <th className="px-5 py-3">Negocio</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Aislamiento</th>
                  <th className="px-5 py-3">Marca</th>
                  <th className="px-5 py-3">Gestion</th>
                </tr>
              </thead>
              <tbody className="bg-white/80">
                {negocios.map((negocio) => (
                  <tr className="border-t" key={negocio.id}>
                    <td className="px-5 py-4 font-black">{negocio.nombre}</td>
                    <td className="px-5 py-4 font-mono text-xs">{negocio.slug}</td>
                    <td className="px-5 py-4 capitalize">{negocio.plan}</td>
                    <td className="px-5 py-4 capitalize">{negocio.estado}</td>
                    <td className="px-5 py-4">{negocio.modoAislamiento}</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        {[negocio.colorPrimario, negocio.colorSecundario, negocio.colorAcento].map((color) => (
                          <span className="size-5 rounded-full border" key={color} style={{ backgroundColor: color }} />
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Link className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white" href={`/super-admin/negocios/${negocio.id}`}>
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  );
}
