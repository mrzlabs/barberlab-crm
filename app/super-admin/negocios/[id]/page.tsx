import Link from "next/link";
import { notFound } from "next/navigation";
import { updateNegocio } from "../actions";
import { getNegocioById, getNegocioStats } from "@/lib/super-admin/queries";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white/80 px-3 py-2 text-sm outline-none focus:border-cyan-500";

export default async function NegocioDetallePage({ params }: { params: { id: string } }) {
  const negocio = await getNegocioById(params.id);
  if (!negocio) notFound();

  const stats = await getNegocioStats(negocio.id);
  const statItems = [
    ["Empleados", stats.empleados],
    ["Clientes", stats.clientes],
    ["Citas", stats.citas],
    ["Turnos", stats.turnos],
    ["Inventario", stats.inventario],
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-violet-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,.32),transparent_18rem),radial-gradient(circle_at_86%_62%,rgba(168,85,247,.38),transparent_20rem)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mac-dots" />
            <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Cliente SaaS</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{negocio.nombre}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              Gestiona identidad visual, suscripcion y aislamiento. Los datos operativos se mantienen separados por negocio_id.
            </p>
          </div>
          <Link className="w-fit rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white backdrop-blur hover:bg-white/15" href="/super-admin/negocios">
            Volver
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statItems.map(([label, value]) => (
          <article className="glass-panel rounded-[1.4rem] p-5" key={label}>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <strong className="mt-2 block text-3xl font-black">{value}</strong>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <form action={updateNegocio} className="glass-panel rounded-[2rem] p-5">
          <input name="id" type="hidden" value={negocio.id} />
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Personalizacion</p>
          <h3 className="mt-1 text-2xl font-black">Marca y suscripcion</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold">
              Nombre
              <input className={input} name="nombre" defaultValue={negocio.nombre} required />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Slug
              <input className={input} name="slug" defaultValue={negocio.slug} required />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Telefono
              <input className={input} name="telefono" defaultValue={negocio.telefono || ""} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Direccion
              <input className={input} name="direccion" defaultValue={negocio.direccion || ""} />
            </label>
            <label className="grid gap-2 text-sm font-bold md:col-span-2">
              Logo URL
              <input className={input} name="logoUrl" defaultValue={negocio.logoUrl || ""} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Color principal
              <input className={input} name="colorPrimario" type="color" defaultValue={negocio.colorPrimario} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Color secundario
              <input className={input} name="colorSecundario" type="color" defaultValue={negocio.colorSecundario} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Color acento
              <input className={input} name="colorAcento" type="color" defaultValue={negocio.colorAcento} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Fuente
              <input className={input} name="fuente" defaultValue={negocio.fuente} />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Plan
              <select className={input} name="plan" defaultValue={negocio.plan}>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Estado
              <select className={input} name="estado" defaultValue={negocio.estado}>
                <option value="activo">Activo</option>
                <option value="suspendido">Suspendido</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold md:col-span-2">
              Aislamiento
              <select className={input} name="modoAislamiento" defaultValue={negocio.modoAislamiento}>
                <option value="multi_tenant">Multi-tenant</option>
                <option value="dedicado">Dedicado</option>
              </select>
            </label>
          </div>
          <button className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white" type="submit">
            Guardar cambios
          </button>
        </form>

        <aside className="glass-panel rounded-[2rem] p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Vista previa</p>
          <div className="mt-4 rounded-[1.6rem] p-5 text-white" style={{ background: `linear-gradient(135deg, ${negocio.colorPrimario}, ${negocio.colorAcento})` }}>
            <div className="grid size-14 place-items-center overflow-hidden rounded-2xl bg-white/95 text-lg font-black" style={{ color: negocio.colorPrimario }}>
              {negocio.logoUrl ? "Logo" : negocio.nombre.slice(0, 2).toUpperCase()}
            </div>
            <h4 className="mt-5 text-2xl font-black">{negocio.nombre}</h4>
            <p className="mt-2 text-sm text-white/75">Plan {negocio.plan} · {negocio.estado}</p>
            <div className="mt-5 flex gap-2">
              <span className="size-7 rounded-full border border-white/30" style={{ backgroundColor: negocio.colorPrimario }} />
              <span className="size-7 rounded-full border border-white/30" style={{ backgroundColor: negocio.colorSecundario }} />
              <span className="size-7 rounded-full border border-white/30" style={{ backgroundColor: negocio.colorAcento }} />
            </div>
          </div>
          <div className="mt-4 rounded-2xl border bg-white/80 p-4 text-sm leading-6 text-slate-600">
            <strong className="block text-slate-950">Independencia de datos</strong>
            Cada negocio opera con su propio `negocio_id`. El modo dedicado queda reservado para clientes enterprise con base separada.
          </div>
        </aside>
      </section>
    </div>
  );
}
