import { fmtMoney } from "@/lib/admin/format";
import { getServiciosAdmin } from "@/lib/admin/catalog";
import { createServicio } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500";

export default async function AdminServiciosPage() {
  const servicios = await getServiciosAdmin();

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form action={createServicio} className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Catalogo comercial</p>
        <h2 className="mt-1 text-2xl font-black">Nuevo servicio</h2>
        <div className="mt-5 grid gap-4">
          <label className="text-xs font-bold uppercase text-muted-foreground">Categoria<select className={input} name="categoria"><option value="barberia">Barberia</option><option value="peluqueria">Peluqueria</option><option value="spa_unas">Spa de unas</option><option value="tatuajes">Tatuajes</option></select></label>
          <label className="text-xs font-bold uppercase text-muted-foreground">Nombre<input className={input} name="nombre" required /></label>
          <label className="text-xs font-bold uppercase text-muted-foreground">Duracion min<input className={input} name="duracionMin" required type="number" defaultValue="45" /></label>
          <label className="text-xs font-bold uppercase text-muted-foreground">Precio<input className={input} name="precio" required type="number" /></label>
          <label className="text-xs font-bold uppercase text-muted-foreground">Costo insumo<input className={input} name="costoInsumo" type="number" defaultValue="0" /></label>
          <label className="flex items-center gap-2 text-sm font-semibold"><input name="activo" type="checkbox" defaultChecked />Activo</label>
          <button className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white" type="submit">Guardar servicio</button>
        </div>
      </form>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5"><h2 className="text-2xl font-black">Servicios</h2><p className="mt-1 text-sm text-muted-foreground">Precios, duracion y costo base para rentabilidad.</p></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-5 py-3">Servicio</th><th className="px-5 py-3">Categoria</th><th className="px-5 py-3 text-right">Duracion</th><th className="px-5 py-3 text-right">Precio</th><th className="px-5 py-3 text-right">Costo</th><th className="px-5 py-3">Estado</th></tr></thead>
            <tbody>
              {servicios.map((item) => (
                <tr className="border-t" key={item.id}><td className="px-5 py-4 font-black">{item.nombre}</td><td className="px-5 py-4 capitalize">{item.categoria.replace("_", " ")}</td><td className="px-5 py-4 text-right">{item.duracionMin} min</td><td className="px-5 py-4 text-right">{fmtMoney(item.precio)}</td><td className="px-5 py-4 text-right">{fmtMoney(item.costoInsumo)}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-black ${item.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{item.activo ? "Activo" : "Inactivo"}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
