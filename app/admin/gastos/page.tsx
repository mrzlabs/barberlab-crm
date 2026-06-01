import { fmtDate, fmtMoney, toDateInput } from "@/lib/admin/format";
import { getGastos } from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth/session";
import { SubmitButton } from "@/components/layout/SubmitButton";
import { createGasto, updateGasto } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };

function param(v: string | string[] | undefined) { return Array.isArray(v) ? v[0] : v; }

export default async function GastosPage({ searchParams }: PageProps) {
  const profile = await requireRole(["admin", "super_admin"]).catch(() => null);
  const negocioId = profile?.negocioId ?? "00000000-0000-0000-0000-000000000000";
  const cat = param(searchParams?.cat);
  const gastos = await getGastos(negocioId, cat);
  const total = gastos.reduce((sum, gasto) => sum + Number(gasto.monto), 0);

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form action={createGasto} className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Registro contable</p>
        <h2 className="mt-1 text-2xl font-black">Nuevo gasto</h2>
        <div className="mt-5 grid gap-4">
          <label className="text-xs font-bold uppercase text-muted-foreground">
            Categoria
            <select className={input} name="categoria" required>
              <option value="arriendo">Arriendo</option>
              <option value="servicios_publicos">Servicios publicos</option>
              <option value="nomina">Nomina</option>
              <option value="insumos">Insumos</option>
              <option value="marketing">Marketing</option>
              <option value="otros">Otros</option>
            </select>
          </label>
          <label className="text-xs font-bold uppercase text-muted-foreground">
            Monto
            <input className={input} min="0" name="monto" required type="number" />
          </label>
          <label className="text-xs font-bold uppercase text-muted-foreground">
            Fecha
            <input className={input} defaultValue={toDateInput()} name="fecha" required type="date" />
          </label>
          <label className="text-xs font-bold uppercase text-muted-foreground">
            Descripcion
            <textarea className={input} name="descripcion" rows={3} />
          </label>
          <label className="text-xs font-bold uppercase text-muted-foreground">
            Comprobante URL
            <input className={input} name="comprobanteUrl" placeholder="https://..." type="url" />
          </label>
          <SubmitButton label="Guardar gasto" pendingLabel="Guardando…" className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white" />
        </div>
      </form>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-black">Gastos registrados</h2>
              <p className="mt-1 text-sm text-muted-foreground">Ultimos 40 movimientos operativos.</p>
            </div>
            <strong className="rounded-xl bg-cyan-50 px-4 py-2 text-cyan-900">{fmtMoney(total)}</strong>
          </div>
          <form className="mt-3 flex flex-wrap gap-2" method="get">
            {["", "arriendo", "servicios_publicos", "nomina", "insumos", "marketing", "otros"].map((c) => (
              <button
                key={c || "todas"}
                name="cat"
                value={c}
                type="submit"
                className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition ${cat === c || (!cat && !c) ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700"}`}
              >
                {c ? c.replace("_", " ") : "Todas"}
              </button>
            ))}
          </form>
        </div>
        <div className="divide-y">
          {gastos.map((gasto) => (
            <div className="p-5" key={gasto.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold capitalize">{gasto.categoria.replace("_", " ")}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{fmtDate(gasto.fecha)} · {gasto.descripcion || "Sin detalle"}</p>
                </div>
                <strong className="text-sm font-black">{fmtMoney(gasto.monto)}</strong>
              </div>

              <details className="mt-3">
                <summary className="cursor-pointer list-none">
                  <span className="inline-flex items-center rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100">
                    Editar
                  </span>
                </summary>
                <form action={updateGasto} className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">
                  <input name="gastoId" type="hidden" value={gasto.id} />
                  <label className="text-xs font-bold uppercase text-muted-foreground">
                    Categoria
                    <select className={input} name="categoria" defaultValue={gasto.categoria}>
                      <option value="arriendo">Arriendo</option>
                      <option value="servicios_publicos">Servicios publicos</option>
                      <option value="nomina">Nomina</option>
                      <option value="insumos">Insumos</option>
                      <option value="marketing">Marketing</option>
                      <option value="otros">Otros</option>
                    </select>
                  </label>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Fecha<input className={input} name="fecha" type="date" defaultValue={gasto.fecha} required /></label>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Monto<input className={input} name="monto" type="number" min="0" defaultValue={String(gasto.monto)} required /></label>
                  <label className="text-xs font-bold uppercase text-muted-foreground">Comprobante URL<input className={input} name="comprobanteUrl" type="url" defaultValue={gasto.comprobanteUrl || ""} /></label>
                  <label className="text-xs font-bold uppercase text-muted-foreground sm:col-span-2">Descripcion<textarea className={input} name="descripcion" rows={2} defaultValue={gasto.descripcion || ""} /></label>
                  <div className="sm:col-span-2">
                    <SubmitButton label="Guardar cambios" pendingLabel="Guardando…" className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-black text-white hover:bg-violet-800" />
                  </div>
                </form>
              </details>
            </div>
          ))}
          {gastos.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">Sin gastos registrados.</p>
          )}
        </div>
      </section>
    </div>
  );
}
