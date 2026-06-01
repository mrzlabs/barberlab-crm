import { fmtMoney } from "@/lib/admin/format";
import { getServiciosAdmin } from "@/lib/admin/catalog";
import { SubmitButton } from "@/components/layout/SubmitButton";
import { ServicioCreateButton, ServicioEditButton } from "@/components/admin/ServicioModal";
import { createServicio, toggleServicio, updateServicio } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminServiciosPage() {
  const servicios = await getServiciosAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Catálogo comercial</p>
          <h2 className="text-2xl font-black">Servicios</h2>
        </div>
        <ServicioCreateButton createAction={createServicio} />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/8 backdrop-blur-md shadow-black/20">
        <div className="border-b border-white/10 p-5">
          <p className="mt-1 text-sm text-slate-400">Precios, duración y costo base para rentabilidad.</p>
        </div>
        <div className="divide-y divide-white/10">
          {servicios.map((item) => (
            <div className="p-5" key={item.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black">{item.nombre}</p>
                  <p className="mt-0.5 text-sm capitalize text-slate-400">{item.categoria.replace("_", " ")} · {item.duracionMin} min</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black">{fmtMoney(item.precio)}</span>
                  <span className="text-xs text-slate-400">Costo {fmtMoney(item.costoInsumo)}</span>
                  <form action={toggleServicio}>
                    <input name="servicioId" type="hidden" value={item.id} />
                    <input name="activo" type="hidden" value={String(!item.activo)} />
                    <SubmitButton
                      label={item.activo ? "Activo" : "Inactivo"}
                      pendingLabel="…"
                      className={`rounded-full px-3 py-1 text-xs font-black transition hover:opacity-60 ${item.activo ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/8 text-slate-300 border border-white/10"}`}
                    />
                  </form>
                  <ServicioEditButton
                    item={{ id: item.id, nombre: item.nombre, categoria: item.categoria, duracionMin: item.duracionMin, precio: item.precio, costoInsumo: item.costoInsumo, activo: item.activo }}
                    updateAction={updateServicio}
                  />
                </div>
              </div>
            </div>
          ))}
          {servicios.length === 0 && (
            <p className="p-8 text-center text-sm text-slate-400">Sin servicios registrados.</p>
          )}
        </div>
      </section>
    </div>
  );
}
