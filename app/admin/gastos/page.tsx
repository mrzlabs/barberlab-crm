import { fmtDate, fmtMoney, toDateInput } from "@/lib/admin/format";
import { getGastos } from "@/lib/admin/queries";
import { createGasto } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500";

export default async function GastosPage() {
  const gastos = await getGastos();
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
          <button className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white" type="submit">
            Guardar gasto
          </button>
        </div>
      </form>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b p-5 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-black">Gastos registrados</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ultimos 40 movimientos operativos.</p>
          </div>
          <strong className="rounded-xl bg-cyan-50 px-4 py-2 text-cyan-900">{fmtMoney(total)}</strong>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Categoria</th>
                <th className="px-5 py-3">Descripcion</th>
                <th className="px-5 py-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {gastos.map((gasto) => (
                <tr className="border-t" key={gasto.id}>
                  <td className="px-5 py-4">{fmtDate(gasto.fecha)}</td>
                  <td className="px-5 py-4 font-semibold capitalize">{gasto.categoria.replace("_", " ")}</td>
                  <td className="px-5 py-4 text-muted-foreground">{gasto.descripcion || "Sin detalle"}</td>
                  <td className="px-5 py-4 text-right font-black">{fmtMoney(gasto.monto)}</td>
                </tr>
              ))}
              {gastos.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-muted-foreground" colSpan={4}>Sin gastos registrados.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
