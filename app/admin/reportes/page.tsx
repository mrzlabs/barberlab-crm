import { fmtMoney } from "@/lib/admin/format";
import { getReportes, parseRange } from "@/lib/admin/reports";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const input = "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500";

function pct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function Kpi({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <strong className="mt-3 block text-2xl font-black tracking-tight">{value}</strong>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </article>
  );
}

export default async function AdminReportesPage({ searchParams }: PageProps) {
  const range = parseRange(searchParams);
  const reportes = await getReportes(range);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">Reportes y KPIs</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Rentabilidad operativa</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Periodo, ingresos, costos de insumo, gastos, margen, comisiones, ticket promedio y no asistencia.
            </p>
          </div>
          <form className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-[1fr_1fr_auto]">
            <label className="text-xs font-bold uppercase text-slate-300">
              Desde
              <input className={input} defaultValue={range.from} name="from" type="date" />
            </label>
            <label className="text-xs font-bold uppercase text-slate-300">
              Hasta
              <input className={input} defaultValue={range.to} name="to" type="date" />
            </label>
            <div className="flex items-end">
              <button className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950" type="submit">
                Aplicar
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Ingresos" value={fmtMoney(reportes.kpis.ingresos)} detail={`${reportes.kpis.turnos} turnos cerrados`} />
        <Kpi label="Margen bruto" value={fmtMoney(reportes.kpis.margenBruto)} detail={`${fmtMoney(reportes.kpis.costoInsumo)} costo insumo`} />
        <Kpi label="Ticket promedio" value={fmtMoney(reportes.kpis.ticket)} detail={`${fmtMoney(reportes.kpis.propinas)} propinas`} />
        <Kpi label="No asistencia" value={pct(reportes.kpis.tasaNoAsistencia)} detail={`${fmtMoney(reportes.kpis.gastos)} gastos periodo`} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <h3 className="text-xl font-black">Rentabilidad por servicio</h3>
            <p className="mt-1 text-sm text-muted-foreground">Ingreso, costo estimado por insumo y margen.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Servicio</th>
                  <th className="px-5 py-3">Categoria</th>
                  <th className="px-5 py-3 text-right">Turnos</th>
                  <th className="px-5 py-3 text-right">Ingreso</th>
                  <th className="px-5 py-3 text-right">Margen</th>
                  <th className="px-5 py-3 text-right">Rent.</th>
                </tr>
              </thead>
              <tbody>
                {reportes.byService.map((item) => (
                  <tr className="border-t" key={`${item.servicio}-${item.categoria}`}>
                    <td className="px-5 py-4 font-black">{item.servicio}</td>
                    <td className="px-5 py-4 capitalize">{item.categoria.replace("_", " ")}</td>
                    <td className="px-5 py-4 text-right">{item.turnos}</td>
                    <td className="px-5 py-4 text-right">{fmtMoney(item.ingresos)}</td>
                    <td className="px-5 py-4 text-right font-black">{fmtMoney(item.margen)}</td>
                    <td className="px-5 py-4 text-right">{pct(item.rentabilidad)}</td>
                  </tr>
                ))}
                {reportes.byService.length === 0 ? (
                  <tr><td className="px-5 py-8 text-center text-muted-foreground" colSpan={6}>Sin turnos en el periodo.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <h3 className="text-xl font-black">Rentabilidad por empleado</h3>
            <p className="mt-1 text-sm text-muted-foreground">Produccion, propinas y comision estimada.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Empleado</th>
                  <th className="px-5 py-3">Especialidad</th>
                  <th className="px-5 py-3 text-right">Turnos</th>
                  <th className="px-5 py-3 text-right">Ingreso</th>
                  <th className="px-5 py-3 text-right">Comision</th>
                </tr>
              </thead>
              <tbody>
                {reportes.byEmployee.map((item) => (
                  <tr className="border-t" key={`${item.empleado}-${item.especialidad}`}>
                    <td className="px-5 py-4 font-black">{item.empleado}</td>
                    <td className="px-5 py-4 capitalize">{item.especialidad.replace("_", " ")}</td>
                    <td className="px-5 py-4 text-right">{item.turnos}</td>
                    <td className="px-5 py-4 text-right">{fmtMoney(item.ingresos + item.propinas)}</td>
                    <td className="px-5 py-4 text-right font-black">{fmtMoney(item.comision)}</td>
                  </tr>
                ))}
                {reportes.byEmployee.length === 0 ? (
                  <tr><td className="px-5 py-8 text-center text-muted-foreground" colSpan={5}>Sin produccion en el periodo.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h3 className="text-xl font-black">Metodo de pago</h3>
          <p className="mt-1 text-sm text-muted-foreground">Distribucion de caja por periodo.</p>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-3">
          {reportes.byPayment.map((item) => (
            <article className="rounded-2xl border bg-slate-50 p-5" key={item.metodoPago}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.metodoPago}</p>
              <strong className="mt-2 block text-2xl font-black">{fmtMoney(item.ingresos)}</strong>
              <p className="mt-1 text-sm text-muted-foreground">{item.turnos} turnos</p>
            </article>
          ))}
          {reportes.byPayment.length === 0 ? <p className="text-sm text-muted-foreground">Sin pagos en el periodo.</p> : null}
        </div>
      </section>
    </div>
  );
}
