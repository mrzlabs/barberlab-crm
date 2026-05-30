import { fmtMoney } from "@/lib/admin/format";
import { getServiciosAdmin } from "@/lib/admin/catalog";
import { SubmitButton } from "@/components/layout/SubmitButton";
import { createServicio, toggleServicio, updateServicio } from "./actions";

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
          <SubmitButton label="Guardar servicio" pendingLabel="Guardando…" className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white" />
        </div>
      </form>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-2xl font-black">Servicios</h2>
          <p className="mt-1 text-sm text-muted-foreground">Precios, duracion y costo base para rentabilidad.</p>
        </div>
        <div className="divide-y">
          {servicios.map((item) => (
            <div className="p-5" key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black">{item.nombre}</p>
                  <p className="mt-0.5 text-sm capitalize text-muted-foreground">{item.categoria.replace("_", " ")} · {item.duracionMin} min</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black">{fmtMoney(item.precio)}</span>
                  <span className="text-xs text-muted-foreground">Costo {fmtMoney(item.costoInsumo)}</span>
                  <form action={toggleServicio}>
                    <input name="servicioId" type="hidden" value={item.id} />
                    <input name="activo" type="hidden" value={String(!item.activo)} />
                    <button
                      type="submit"
                      title={item.activo ? "Click para desactivar" : "Click para activar"}
                      className={`rounded-full px-3 py-1 text-xs font-black transition hover:opacity-60 ${item.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {item.activo ? "Activo" : "Inactivo"}
                    </button>
                  </form>
                </div>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer list-none">
                  <span className="inline-flex items-center rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100">
                    Editar
                  </span>
                </summary>
                <form action={updateServicio} className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">
                  <input name="servicioId" type="hidden" value={item.id} />
                  <label className="text-xs font-bold uppercase text-muted-foreground sm:col-span-2">Nombre<input className={input} name="nombre" defaultValue={item.nombre} required /></label>
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Categoria
                    <select className={input} name="categoria" defaultValue={item.categoria}>
                      <option value="barberia">Barberia</option>
                      <option value="peluqueria">Peluqueria</option>
                      <option value="spa_unas">Spa de unas</option>
                      <option value="tatuajes">Tatuajes</option>
                    </select>
                  </label>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Duracion min<input className={input} name="duracionMin" type="number" defaultValue={item.duracionMin} required /></label>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Precio<input className={input} name="precio" type="number" defaultValue={item.precio} required /></label>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Costo insumo<input className={input} name="costoInsumo" type="number" defaultValue={item.costoInsumo} /></label>
                  <div className="flex items-end sm:col-span-2 gap-4">
                    <label className="flex items-center gap-2 text-sm font-semibold"><input name="activo" type="checkbox" defaultChecked={item.activo} />Activo</label>
                    <SubmitButton label="Guardar cambios" pendingLabel="Guardando…" className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-black text-white hover:bg-violet-800" />
                  </div>
                </form>
              </details>
            </div>
          ))}
          {servicios.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">Sin servicios registrados.</p>
          )}
        </div>
      </section>
    </div>
  );
}
