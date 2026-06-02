import { fmtMoney } from "@/lib/admin/format";
import { getReportes, getTrendDiaria, parseRange } from "@/lib/admin/reports";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { DonutChart } from "@/components/reports/DonutChart";
import { TrendChart } from "@/components/reports/TrendChart";
import { DndReportLayout } from "@/components/reports/DndReportLayout";
import { DateRangePicker } from "@/components/reports/DateRangePicker";
import { SelectableKpiGrid } from "@/components/reports/SelectableKpiGrid";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };

function pct(value: number) { return `${(value * 100).toFixed(1)}%`; }

const commissionBaseLabel: Record<string, string> = {
  precio_final: "Precio final",
  precio_menos_descuento: "Precio menos descuento",
  precio_menos_insumo: "Precio menos insumo",
};

function KpiCard({ label, value, detail, accent, icon }: { label: string; value: string; detail: string; accent: string; icon: string }) {
  return (
    <article className={`report-kpi relative overflow-hidden rounded-2xl border border-white/8 bg-slate-900 p-5 shadow-sm ${accent}`}>
      <span className="absolute right-4 top-4 text-2xl opacity-20 select-none">{icon}</span>
      <p className="report-kpi-label crm-label">{label}</p>
      <strong className="report-kpi-value mt-2 block truncate text-2xl font-black crm-text-primary">{value}</strong>
      <p className="report-kpi-detail mt-1 truncate text-xs crm-text-muted">{detail}</p>
    </article>
  );
}

export default async function AdminReportesPage({ searchParams }: PageProps) {
  const range = parseRange(searchParams);
  const [r, trend] = await Promise.all([getReportes(range), getTrendDiaria(range)]);
  const maxSvc = Math.max(...r.byService.map((s) => s.ingresos), 0);
  const maxEmp = Math.max(...r.byEmployee.map((e) => e.ingresos + e.propinas), 0);
  const topSvc = r.byService[0];
  const topEmp = r.byEmployee[0];
  const topPay = r.byPayment[0];
  const hasData = r.kpis.turnos > 0;
  const serviceShare = hasData && topSvc ? (topSvc.turnos / r.kpis.turnos) * 100 : 0;
  const employeeShare = hasData && topEmp ? (topEmp.turnos / r.kpis.turnos) * 100 : 0;

  const inputCls = "w-full rounded-xl crm-input px-3 py-2 text-sm placeholder:text-slate-500 outline-none focus:border-cyan-400";

  // ── DnD modules ───────────────────────────────────────────────────────────

  const modules = [
    {
      id: "tendencia",
      label: "Tendencia diaria",
      node: (
        <section className="overflow-hidden crm-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <div>
              <h3 className="report-truncate font-black">Ingresos por día</h3>
              <p className="report-truncate text-xs text-slate-400">Evolución diaria de ingresos (precio final + propinas) en el período.</p>
            </div>
            <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-bold text-cyan-700">{trend.length} días</span>
          </div>
          <div className="p-5"><TrendChart data={trend} /></div>
        </section>
      ),
    },
    {
      id: "tendencias-comerciales",
      label: "Tendencias comerciales",
      node: (
        <section className="grid gap-4 md:grid-cols-3">
          <article className="crm-card p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-400">Tendencia</p>
            <h3 className="mt-1 text-lg font-black">Servicio líder</h3>
            {topSvc ? (
              <>
                <p className="report-truncate mt-2 text-xs leading-5 text-slate-500">{topSvc.servicio} concentra la mayor producción del periodo.</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${Math.max(8, (topSvc.ingresos / maxSvc) * 100)}%` }} />
                </div>
                <strong className="report-truncate mt-3 block text-xl font-black crm-text-primary">{fmtMoney(topSvc.ingresos)}</strong>
                <span className="report-truncate text-xs text-slate-400">{topSvc.turnos} turnos · {pct(topSvc.rentabilidadNeta)} utilidad neta</span>
              </>
            ) : <p className="mt-3 text-sm text-slate-400">Sin turnos en el periodo.</p>}
          </article>
          <article className="crm-card p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-400">Talento</p>
            <h3 className="mt-1 text-lg font-black">Especialista líder</h3>
            {topEmp ? (
              <>
                <p className="report-truncate mt-2 text-xs leading-5 text-slate-500">{topEmp.empleado} marca la mayor producción del periodo.</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.max(8, ((topEmp.ingresos + topEmp.propinas) / maxEmp) * 100)}%` }} />
                </div>
                <strong className="report-truncate mt-3 block text-xl font-black crm-text-primary">{fmtMoney(topEmp.ingresos + topEmp.propinas)}</strong>
                <span className="report-truncate text-xs text-slate-400">{topEmp.turnos} turnos · utilidad {fmtMoney(topEmp.utilidadNegocio)}</span>
              </>
            ) : <p className="mt-3 text-sm text-slate-400">Sin producción por empleado.</p>}
          </article>
          <article className="crm-card p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-400">Caja</p>
            <h3 className="mt-1 text-lg font-black">Método dominante</h3>
            {topPay ? (
              <>
                <p className="report-truncate mt-2 text-xs leading-5 text-slate-500">El método con mayor volumen facilita conciliación y arqueo.</p>
                <strong className="report-truncate mt-4 block text-2xl font-black capitalize crm-text-primary">{topPay.metodoPago}</strong>
                <span className="report-truncate text-xs text-slate-400">{fmtMoney(topPay.ingresos)} · {topPay.turnos} turnos</span>
              </>
            ) : <p className="mt-3 text-sm text-slate-400">Sin pagos en el periodo.</p>}
          </article>
        </section>
      ),
    },
    {
      id: "tablas",
      label: "Tablas de datos",
      node: (
        <section className="grid gap-6 xl:grid-cols-2">
          <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="report-truncate font-black">Rentabilidad por servicio</h3>
                <p className="report-truncate text-xs text-slate-400">Ingreso, costo y margen por servicio.</p>
              </div>
              <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-bold text-cyan-700">{r.byService.length} servicios</span>
            </div>
            <div className="overflow-x-auto scrollbar-soft">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-950 text-[10px] uppercase tracking-wide text-cyan-100">
                  <tr>
                    <th className="px-5 py-3">Servicio</th>
                    <th className="px-5 py-3">Categoría</th>
                    <th className="px-4 py-3 text-right">Turnos</th>
                    <th className="px-4 py-3 text-right">Ingreso</th>
                    <th className="px-4 py-3 text-right">Costo</th>
                    <th className="px-4 py-3 text-right">Comisión</th>
                    <th className="px-4 py-3 text-right">Utilidad</th>
                    <th className="px-4 py-3 text-right">Rent. neta</th>
                  </tr>
                </thead>
                <tbody>
                  {r.byService.map((s, i) => (
                    <tr className={`border-t transition hover:bg-slate-800/40 ${i % 2 === 0 ? "" : "bg-slate-800/20"}`} key={`${s.servicio}-${s.categoria}`}>
                      <td className="max-w-[220px] px-5 py-3.5 font-semibold"><span className="report-truncate block">{s.servicio}</span></td>
                      <td className="max-w-[180px] px-5 py-3.5 capitalize text-slate-500"><span className="report-truncate block">{s.categoria.replace("_", " ")}</span></td>
                      <td className="px-4 py-3.5 text-right tabular-nums">{s.turnos}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums font-semibold">{fmtMoney(s.ingresos)}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums">{fmtMoney(s.costoInsumo)}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums">{fmtMoney(s.comision)}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums font-black">{fmtMoney(s.utilidadNeta)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${s.rentabilidadNeta >= 0.4 ? "bg-emerald-100 text-emerald-700" : s.rentabilidadNeta >= 0.2 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                          {pct(s.rentabilidadNeta)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {r.byService.length === 0 && <tr><td className="px-5 py-8 text-center text-slate-400" colSpan={8}>Sin turnos en el periodo.</td></tr>}
                </tbody>
              </table>
            </div>
          </article>
          <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h3 className="report-truncate font-black">Producción por empleado</h3>
                <p className="report-truncate text-xs text-slate-400">Producción, costo, comisión y utilidad para el negocio.</p>
              </div>
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700">{r.byEmployee.length} empleados</span>
            </div>
            <div className="overflow-x-auto scrollbar-soft">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-950 text-[10px] uppercase tracking-wide text-cyan-100">
                  <tr>
                    <th className="px-5 py-3">Empleado</th>
                    <th className="px-5 py-3">Especialidad</th>
                    <th className="px-4 py-3 text-right">Turnos</th>
                    <th className="px-4 py-3 text-right">Producción</th>
                    <th className="px-4 py-3 text-right">Costo</th>
                    <th className="px-4 py-3 text-right">Comisión</th>
                    <th className="px-4 py-3 text-right">Utilidad</th>
                  </tr>
                </thead>
                <tbody>
                  {r.byEmployee.map((e, i) => (
                    <tr className={`border-t transition hover:bg-slate-800/40 ${i % 2 === 0 ? "" : "bg-slate-800/20"}`} key={`${e.empleado}-${e.especialidad}`}>
                      <td className="max-w-[220px] px-5 py-3.5 font-semibold"><span className="report-truncate block">{e.empleado}</span></td>
                      <td className="max-w-[180px] px-5 py-3.5 capitalize text-slate-500"><span className="report-truncate block">{e.especialidad.replace("_", " ")}</span></td>
                      <td className="px-4 py-3.5 text-right tabular-nums">{e.turnos}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums font-semibold">{fmtMoney(e.ingresos + e.propinas)}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums">{fmtMoney(e.costoInsumo)}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums font-black text-violet-700">{fmtMoney(e.comision)}</td>
                      <td className="px-4 py-3.5 text-right tabular-nums font-black text-emerald-700">{fmtMoney(e.utilidadNegocio)}</td>
                    </tr>
                  ))}
                  {r.byEmployee.length === 0 && <tr><td className="px-5 py-8 text-center text-slate-400" colSpan={7}>Sin producción en el periodo.</td></tr>}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ),
    },
    {
      id: "pagos-donuts",
      label: "Métodos de pago y distribución",
      node: (
        <section className="grid gap-6 xl:grid-cols-[1fr_1.6fr]">
          <article className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md shadow-sm">
            <div className="border-b px-5 py-4">
              <h3 className="report-truncate font-black">Método de pago</h3>
              <p className="report-truncate text-xs text-slate-400">Distribución de caja por periodo.</p>
            </div>
            <div className="grid gap-3 p-5">
              {r.byPayment.map((p) => (
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/8 px-4 py-3.5" key={p.metodoPago}>
                  <div>
                    <p className="text-[11px] font-bold capitalize text-slate-500">{p.metodoPago}</p>
                    <strong className="text-lg font-black crm-text-primary">{fmtMoney(p.ingresos)}</strong>
                  </div>
                  <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">{p.turnos} turnos</span>
                </div>
              ))}
              {r.byPayment.length === 0 && <p className="text-sm text-slate-400">Sin pagos en el periodo.</p>}
            </div>
          </article>
          <div className="grid gap-4 md:grid-cols-2">
            <DonutChart title="Distribución por servicio" centerLabel="servicios" slices={r.byService.map((s) => ({ label: s.servicio, value: s.turnos }))} />
            <DonutChart title="Distribución por empleado" centerLabel="empleados" slices={r.byEmployee.map((e) => ({ label: e.empleado, value: e.turnos }))} />
          </div>
        </section>
      ),
    },
  ];

  return (
    <div className="space-y-6 print:space-y-4">

      {/* ── Hero + filtro ─── */}
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
            <div className="flex flex-wrap items-center gap-2">
              <ExportButtons byService={r.byService} byEmployee={r.byEmployee} byPayment={r.byPayment} kpis={r.kpis} from={range.from} to={range.to} />
              <div className="flex gap-1.5 no-print">
                {[{ label: "CSV servicios", tipo: "servicios" }, { label: "CSV empleados", tipo: "empleados" }, { label: "CSV pagos", tipo: "pagos" }].map(({ label, tipo }) => (
                  <a key={tipo} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-black text-white hover:bg-white/20 transition" href={`/admin/reportes/export-csv?from=${range.from}&to=${range.to}&tipo=${tipo}`} download>↓ {label}</a>
                ))}
              </div>
            </div>
          </div>
          <DateRangePicker from={range.from} to={range.to} />
          <p className="mt-3 text-[11px] font-semibold text-slate-500">Periodo activo: {range.from} — {range.to}</p>
        </div>
      </section>

      {/* ── KPIs fijos (seleccionables) ─── */}
      <SelectableKpiGrid kpis={[
        { id: "ingresos",    label: "Ingresos",        value: fmtMoney(r.kpis.ingresos),      detail: `${r.kpis.turnos} turnos cerrados`,                     accentClass: "border-l-4 border-l-cyan-400",   icon: "$"  },
        { id: "utilidad",    label: "Utilidad neta",   value: fmtMoney(r.kpis.utilidadNeta),  detail: "Luego de insumos, gastos y comisiones",                accentClass: "border-l-4 border-l-emerald-400", icon: "UN" },
        { id: "margen",      label: "Margen bruto",    value: fmtMoney(r.kpis.margenBruto),   detail: `${fmtMoney(r.kpis.costoInsumo)} costo insumo`,        accentClass: "border-l-4 border-l-violet-400",  icon: "MB" },
        { id: "comisiones",  label: "Comisiones",      value: fmtMoney(r.kpis.comisiones),    detail: commissionBaseLabel[r.settings.comisionBase] || "Precio final", accentClass: "border-l-4 border-l-amber-400", icon: "%" },
        { id: "ticket",      label: "Ticket promedio", value: fmtMoney(r.kpis.ticket),        detail: `${fmtMoney(r.kpis.propinas)} propinas`,               accentClass: "border-l-4 border-l-sky-400",    icon: "TP" },
        { id: "gastos",      label: "Gastos",          value: fmtMoney(r.kpis.gastos),        detail: "Operación del periodo",                               accentClass: "border-l-4 border-l-rose-400",   icon: "G"  },
        { id: "costo",       label: "Costo insumo",    value: fmtMoney(r.kpis.costoInsumo),   detail: "Descuento por servicio cerrado",                      accentClass: "border-l-4 border-l-teal-400",   icon: "CI" },
        { id: "noasistencia",label: "No asistencia",   value: pct(r.kpis.tasaNoAsistencia),   detail: "Citas no asistidas sobre citas totales",              accentClass: "border-l-4 border-l-orange-400", icon: "NA" },
      ]} />

      {/* regla contable */}
      <section className="grid gap-3 rounded-xl border border-slate-700/50 bg-slate-900/80 p-4 shadow-lg sm:grid-cols-3">
        <article>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Regla de comisión</p>
          <strong className="mt-1 block text-sm">{commissionBaseLabel[r.settings.comisionBase] || "Precio final"}</strong>
        </article>
        <article>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Propina en comisión</p>
          <strong className="mt-1 block text-sm">{r.settings.propinaEnComision ? "Incluida" : "No incluida"}</strong>
        </article>
        <article>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Editable en</p>
          <strong className="mt-1 block text-sm">Admin / Configuración</strong>
        </article>
      </section>

      {/* ── Módulos reordenables con DnD ─── */}
      <div className="relative">
        <p className="mb-2 ml-8 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Arrastra los módulos para reordenarlos — el orden se guarda localmente
        </p>
        <DndReportLayout modules={modules} />
      </div>

    </div>
  );
}

