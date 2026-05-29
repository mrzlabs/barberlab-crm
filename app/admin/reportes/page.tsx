import { fmtMoney } from "@/lib/admin/format";
import { getReportes, parseRange } from "@/lib/admin/reports";
import { ExportButtons } from "@/components/reports/ExportButtons";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };

function pct(value: number) { return `${(value * 100).toFixed(1)}%`; }

function KpiCard({
  label, value, detail, accent, icon,
}: { label: string; value: string; detail: string; accent: string; icon: string }) {
  return (
    <article className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm ${accent}`}>
      <span className="absolute right-4 top-4 text-2xl opacity-20 select-none">{icon}</span>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <strong className="mt-2 block truncate text-xl font-black tracking-tight sm:text-2xl">{value}</strong>
      <p className="mt-1 truncate text-xs text-slate-500">{detail}</p>
    </article>
  );
}

function HeatCell({ label, value, max }: { label: string; value: number; max: number }) {
  const ratio = max ? value / max : 0;
  const bg = ratio >= 0.76 ? "bg-cyan-500 text-white" : ratio >= 0.46 ? "bg-violet-500 text-white" : ratio >= 0.18 ? "bg-amber-200 text-slate-900" : "bg-slate-100 text-slate-500";
  return (
    <div className={`rounded-xl p-3 ${bg}`}>
      <strong className="block truncate text-xs font-semibold leading-tight">{label}</strong>
      <span className="mt-1 block text-[11px] font-bold opacity-80">{fmtMoney(value)}</span>
    </div>
  );
}

export default async function AdminReportesPage({ searchParams }: PageProps) {
  const range = parseRange(searchParams);
  const r = await getReportes(range);
  const maxSvc = Math.max(...r.byService.map((s) => s.ingresos), 0);
  const maxEmp = Math.max(...r.byEmployee.map((e) => e.ingresos + e.propinas), 0);
  const topSvc = r.byService[0];
  const topEmp = r.byEmployee[0];
  const topPay = r.byPayment[0];
  const hasData = r.kpis.turnos > 0;

  const inputCls = "w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 outline-none focus:border-cyan-400";

  return (
    <div className="space-y-6 print:space-y-4">

      {/* ── Hero + filtro + export ─── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl shadow-violet-950/20 sm:p-8 print:rounded-xl print:p-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(34,211,238,.32),transparent_18rem),radial-gradient(circle_at_84%_68%,rgba(168,85,247,.36),transparent_20rem)]" />
        <div className="relative">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300">Reportes y KPIs · BarberLab</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Rentabilidad operativa</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                Ingresos, costos, márgenes, comisiones, ticket promedio y rendimiento por empleado y servicio.
              </p>
            </div>
            <ExportButtons
              byService={r.byService}
              byEmployee={r.byEmployee}
              byPayment={r.byPayment}
              kpis={r.kpis}
              from={range.from}
              to={range.to}
            />
          </div>

          {/* date filter */}
          <form className="mt-5 flex flex-wrap items-end gap-3 no-print">
            <label className="grid gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Desde
              <input className={inputCls} defaultValue={range.from} name="from" type="date" />
            </label>
            <label className="grid gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Hasta
              <input className={inputCls} defaultValue={range.to} name="to" type="date" />
            </label>
            <button className="rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-black text-slate-950 hover:bg-cyan-300 transition" type="submit">
              Aplicar
            </button>
          </form>

          {/* period label */}
          <p className="mt-4 text-[11px] font-semibold text-slate-500">
            Periodo: {range.from} — {range.to}
          </p>
        </div>
      </section>

      {/* ── KPIs ─── */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <KpiCard label="Ingresos" value={fmtMoney(r.kpis.ingresos)} detail={`${r.kpis.turnos} turnos cerrados`} accent="border-l-4 border-l-cyan-400" icon="💰" />
        <KpiCard label="Margen bruto" value={fmtMoney(r.kpis.margenBruto)} detail={`${fmtMoney(r.kpis.costoInsumo)} costo insumo`} accent="border-l-4 border-l-violet-400" icon="📈" />
        <KpiCard label="Ticket promedio" value={fmtMoney(r.kpis.ticket)} detail={`${fmtMoney(r.kpis.propinas)} propinas`} accent="border-l-4 border-l-emerald-400" icon="🎫" />
        <KpiCard label="No asistencia" value={pct(r.kpis.tasaNoAsistencia)} detail={`${fmtMoney(r.kpis.gastos)} gastos`} accent="border-l-4 border-l-amber-400" icon="⚠️" />
      </section>

      {/* ── Tendencias comerciales ─── */}
      <section className="grid gap-4 md:grid-cols-3">
        {/* servicio líder */}
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-600">Tendencia</p>
          <h3 className="mt-1 text-lg font-black">Servicio líder</h3>
          {topSvc ? (
            <>
              <p className="mt-2 text-xs leading-5 text-slate-500">{topSvc.servicio} concentra la mayor producción del periodo.</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${Math.max(8, (topSvc.ingresos / maxSvc) * 100)}%` }} />
              </div>
              <strong className="mt-3 block text-xl font-black">{fmtMoney(topSvc.ingresos)}</strong>
              <span className="text-xs text-slate-400">{topSvc.turnos} turnos · {pct(topSvc.rentabilidad)} margen</span>
            </>
          ) : <p className="mt-3 text-sm text-slate-400">Sin turnos en el periodo.</p>}
        </article>

        {/* empleado líder */}
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600">Talento</p>
          <h3 className="mt-1 text-lg font-black">Especialista líder</h3>
          {topEmp ? (
            <>
              <p className="mt-2 text-xs leading-5 text-slate-500">{topEmp.empleado} marca la mayor producción del periodo.</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.max(8, ((topEmp.ingresos + topEmp.propinas) / maxEmp) * 100)}%` }} />
              </div>
              <strong className="mt-3 block text-xl font-black">{fmtMoney(topEmp.ingresos + topEmp.propinas)}</strong>
              <span className="text-xs text-slate-400">{topEmp.turnos} turnos · comisión {fmtMoney(topEmp.comision)}</span>
            </>
          ) : <p className="mt-3 text-sm text-slate-400">Sin producción por empleado.</p>}
        </article>

        {/* pago dominante */}
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">Caja</p>
          <h3 className="mt-1 text-lg font-black">Método dominante</h3>
          {topPay ? (
            <>
              <p className="mt-2 text-xs leading-5 text-slate-500">El método con mayor volumen facilita conciliación y arqueo.</p>
              <strong className="mt-4 block text-2xl font-black capitalize">{topPay.metodoPago}</strong>
              <span className="text-xs text-slate-400">{fmtMoney(topPay.ingresos)} · {topPay.turnos} turnos</span>
            </>
          ) : <p className="mt-3 text-sm text-slate-400">Sin pagos en el periodo.</p>}
        </article>
      </section>

      {/* ── Tablas de datos ─── */}
      <section className="grid gap-6 xl:grid-cols-2">

        {/* servicios */}
        <article className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h3 className="font-black">Rentabilidad por servicio</h3>
              <p className="text-xs text-slate-500">Ingreso, costo y margen por servicio.</p>
            </div>
            <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-bold text-cyan-700">{r.byService.length} servicios</span>
          </div>
          <div className="overflow-x-auto scrollbar-soft">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-950 text-[10px] uppercase tracking-wide text-cyan-100">
                <tr>
                  <th className="px-5 py-3">Servicio</th>
                  <th className="px-5 py-3">Categoría</th>
                  <th className="px-4 py-3 text-right">Turnos</th>
                  <th className="px-4 py-3 text-right">Ingreso</th>
                  <th className="px-4 py-3 text-right">Margen</th>
                  <th className="px-4 py-3 text-right">Rent.</th>
                </tr>
              </thead>
              <tbody>
                {r.byService.map((s, i) => (
                  <tr className={`border-t transition hover:bg-slate-50 ${i % 2 === 0 ? "" : "bg-slate-50/40"}`} key={`${s.servicio}-${s.categoria}`}>
                    <td className="px-5 py-3.5 font-semibold">{s.servicio}</td>
                    <td className="px-5 py-3.5 capitalize text-slate-500">{s.categoria.replace("_", " ")}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums">{s.turnos}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums font-semibold">{fmtMoney(s.ingresos)}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums font-black">{fmtMoney(s.margen)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${s.rentabilidad >= 0.5 ? "bg-emerald-100 text-emerald-700" : s.rentabilidad >= 0.25 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                        {pct(s.rentabilidad)}
                      </span>
                    </td>
                  </tr>
                ))}
                {r.byService.length === 0 && (
                  <tr><td className="px-5 py-8 text-center text-slate-400" colSpan={6}>Sin turnos en el periodo.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        {/* empleados */}
        <article className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h3 className="font-black">Producción por empleado</h3>
              <p className="text-xs text-slate-500">Producción, propinas y comisión estimada.</p>
            </div>
            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">{r.byEmployee.length} empleados</span>
          </div>
          <div className="overflow-x-auto scrollbar-soft">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-slate-950 text-[10px] uppercase tracking-wide text-cyan-100">
                <tr>
                  <th className="px-5 py-3">Empleado</th>
                  <th className="px-5 py-3">Especialidad</th>
                  <th className="px-4 py-3 text-right">Turnos</th>
                  <th className="px-4 py-3 text-right">Producción</th>
                  <th className="px-4 py-3 text-right">Comisión</th>
                </tr>
              </thead>
              <tbody>
                {r.byEmployee.map((e, i) => (
                  <tr className={`border-t transition hover:bg-slate-50 ${i % 2 === 0 ? "" : "bg-slate-50/40"}`} key={`${e.empleado}-${e.especialidad}`}>
                    <td className="px-5 py-3.5 font-semibold">{e.empleado}</td>
                    <td className="px-5 py-3.5 capitalize text-slate-500">{e.especialidad.replace("_", " ")}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums">{e.turnos}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums font-semibold">{fmtMoney(e.ingresos + e.propinas)}</td>
                    <td className="px-4 py-3.5 text-right tabular-nums font-black text-violet-700">{fmtMoney(e.comision)}</td>
                  </tr>
                ))}
                {r.byEmployee.length === 0 && (
                  <tr><td className="px-5 py-8 text-center text-slate-400" colSpan={5}>Sin producción en el periodo.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {/* ── Método de pago + mapa de calor ─── */}
      <section className="grid gap-6 xl:grid-cols-[1fr_1.6fr]">

        {/* métodos de pago */}
        <article className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h3 className="font-black">Método de pago</h3>
            <p className="text-xs text-slate-500">Distribución de caja por periodo.</p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-1">
            {r.byPayment.map((p) => (
              <div className="flex items-center justify-between rounded-xl border bg-slate-50 px-4 py-3.5" key={p.metodoPago}>
                <div>
                  <p className="text-[11px] font-bold capitalize text-slate-500">{p.metodoPago}</p>
                  <strong className="text-lg font-black">{fmtMoney(p.ingresos)}</strong>
                </div>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">{p.turnos} turnos</span>
              </div>
            ))}
            {r.byPayment.length === 0 && <p className="text-sm text-slate-400">Sin pagos en el periodo.</p>}
          </div>
        </article>

        {/* mapa de calor */}
        <article className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h3 className="font-black">Mapa de calor operativo</h3>
            <p className="text-xs text-slate-500">Intensidad de ingreso por servicio y empleado.</p>
          </div>
          {hasData ? (
            <div className="grid gap-6 p-5 md:grid-cols-2">
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Servicios</p>
                <div className="grid grid-cols-2 gap-2">
                  {r.byService.map((s) => <HeatCell key={s.servicio} label={s.servicio} value={s.ingresos} max={maxSvc} />)}
                </div>
              </div>
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Empleados</p>
                <div className="grid grid-cols-2 gap-2">
                  {r.byEmployee.map((e) => <HeatCell key={e.empleado} label={e.empleado} value={e.ingresos + e.propinas} max={maxEmp} />)}
                </div>
              </div>
            </div>
          ) : (
            <p className="p-6 text-sm text-slate-400">Sin datos suficientes para mapa de calor.</p>
          )}
        </article>
      </section>

    </div>
  );
}
