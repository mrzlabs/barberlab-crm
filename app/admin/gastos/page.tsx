import { fmtDate, fmtMoney } from "@/lib/admin/format";
import { getGastos } from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth/session";
import { GastoCreateButton, GastoEditButton } from "@/components/admin/GastoModal";
import { createGasto, updateGasto } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };
function param(v: string | string[] | undefined) { return Array.isArray(v) ? v[0] : v; }

export default async function GastosPage({ searchParams }: PageProps) {
  const profile = await requireRole(["admin", "super_admin"]).catch(() => null);
  const negocioId = profile?.negocioId ?? "00000000-0000-0000-0000-000000000000";
  const cat = param(searchParams?.cat);
  const gastos = await getGastos(negocioId, cat);
  const total = gastos.reduce((sum, gasto) => sum + Number(gasto.monto), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Registro contable</p>
          <h2 className="text-2xl font-black">Gastos</h2>
        </div>
        <GastoCreateButton createAction={createGasto} />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/8 backdrop-blur-md shadow-black/20">
        <div className="border-b border-white/10 p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-black">Gastos registrados</h2>
              <p className="mt-1 text-sm text-slate-400">Últimos 40 movimientos operativos.</p>
            </div>
            <strong className="rounded-xl bg-cyan-500/20 px-4 py-2 text-cyan-300 border border-cyan-500/30">{fmtMoney(total)}</strong>
          </div>
          <form className="mt-3 flex flex-wrap gap-2" method="get">
            {["", "arriendo", "servicios_publicos", "nomina", "insumos", "marketing", "otros"].map((c) => (
              <button
                key={c || "todas"}
                name="cat"
                value={c}
                type="submit"
                className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition ${cat === c || (!cat && !c) ? "bg-slate-950 text-white" : "border border-white/10 bg-white/8 text-slate-300 hover:border-violet-500/40 hover:text-violet-400"}`}
              >
                {c ? c.replace("_", " ") : "Todas"}
              </button>
            ))}
          </form>
        </div>
        <div className="divide-y divide-white/10">
          {gastos.map((gasto) => (
            <div className="p-5" key={gasto.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold capitalize">{gasto.categoria.replace("_", " ")}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{fmtDate(gasto.fecha)} · {gasto.descripcion || "Sin detalle"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <strong className="text-sm font-black">{fmtMoney(gasto.monto)}</strong>
                  <GastoEditButton
                    item={{ id: gasto.id, categoria: gasto.categoria, monto: gasto.monto, fecha: gasto.fecha, descripcion: gasto.descripcion, comprobanteUrl: gasto.comprobanteUrl }}
                    updateAction={updateGasto}
                  />
                </div>
              </div>
            </div>
          ))}
          {gastos.length === 0 && (
            <p className="p-8 text-center text-sm text-slate-400">Sin gastos registrados.</p>
          )}
        </div>
      </section>
    </div>
  );
}
