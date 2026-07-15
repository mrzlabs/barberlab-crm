import { Download } from "lucide-react";
import { fmtMoney } from "@/lib/admin/format";
import { getReportes, getTrendDiaria, parseRange } from "@/lib/admin/reports";
import { ExportButtons } from "@/components/reports/ExportButtons";
import { DonutChart } from "@/components/reports/DonutChart";
import { TrendChart } from "@/components/reports/TrendChart";
import { DndReportLayout } from "@/components/reports/DndReportLayout";
import { DateRangePicker } from "@/components/reports/DateRangePicker";
import { SelectableKpiGrid } from "@/components/reports/SelectableKpiGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };

function pct(value: number) { return `${(value * 100).toFixed(1)}%`; }

const commissionBaseLabel: Record<string, string> = {
  precio_final: "Precio final",
  precio_menos_descuento: "Precio menos descuento",
  precio_menos_insumo: "Precio menos insumo",
};

const cardCls = "overflow-hidden rounded-card border border-ds-border bg-ds-surface shadow-ds-sm";
const cardHead = "flex items-center justify-between gap-3 border-b border-ds-border px-5 py-4";

export default async function AdminReportesPage({ searchParams }: PageProps) {
  const range = parseRange(searchParams);
  const [r, trend] = await Promise.all([getReportes(range), getTrendDiaria(range)]);
  const maxSvc = Math.max(...r.byService.map((s) => s.ingresos), 0);
  const maxEmp = Math.max(...r.byEmployee.map((e) => e.ingresos + e.propinas), 0);
  const topSvc = r.byService[0];
  const topEmp = r.byEmployee[0];
  const topPay = r.byPayment[0];

  const modules = [
    {
      id: "tendencia",
      label: "Tendencia diaria",
      node: (
        <section className={cardCls}>
          <div className={cardHead}>
            <div className="min-w-0">
              <h3 className="font-semibold text-ds-fg">Ingresos por día</h3>
              <p className="truncate text-[12px] text-ds-fg-muted">Evolución diaria de ingresos (precio final + propinas) en el período.</p>
            </div>
            <Badge tone="neutral">{trend.length} días</Badge>
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
          <article className="rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ds-fg-muted">Servicio líder</p>
            {topSvc ? (
              <>
                <h3 className="mt-1 text-[15px] font-semibold text-ds-fg">{topSvc.servicio}</h3>
                <p className="mt-2 text-[12px] leading-5 text-ds-fg-muted">Concentra la mayor producción del periodo.</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ds-surface-2">
                  <div className="h-full rounded-full bg-ds-primary" style={{ width: `${Math.max(8, (topSvc.ingresos / maxSvc) * 100)}%` }} />
                </div>
                <strong className="ds-nums mt-3 block truncate text-lg font-semibold text-ds-fg">{fmtMoney(topSvc.ingresos)}</strong>
                <span className="ds-nums text-[12px] text-ds-fg-muted">{topSvc.turnos} turnos · {pct(topSvc.rentabilidadNeta)} utilidad neta</span>
              </>
            ) : <p className="mt-3 text-sm text-ds-fg-subtle">Sin turnos en el periodo.</p>}
          </article>
          <article className="rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ds-fg-muted">Especialista líder</p>
            {topEmp ? (
              <>
                <h3 className="mt-1 text-[15px] font-semibold text-ds-fg">{topEmp.empleado}</h3>
                <p className="mt-2 text-[12px] leading-5 text-ds-fg-muted">Marca la mayor producción del periodo.</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ds-surface-2">
                  <div className="h-full rounded-full bg-ds-primary" style={{ width: `${Math.max(8, ((topEmp.ingresos + topEmp.propinas) / maxEmp) * 100)}%` }} />
                </div>
                <strong className="ds-nums mt-3 block truncate text-lg font-semibold text-ds-fg">{fmtMoney(topEmp.ingresos + topEmp.propinas)}</strong>
                <span className="ds-nums text-[12px] text-ds-fg-muted">{topEmp.turnos} turnos · utilidad {fmtMoney(topEmp.utilidadNegocio)}</span>
              </>
            ) : <p className="mt-3 text-sm text-ds-fg-subtle">Sin producción por empleado.</p>}
          </article>
          <article className="rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ds-fg-muted">Método dominante</p>
            {topPay ? (
              <>
                <h3 className="mt-1 text-[15px] font-semibold capitalize text-ds-fg">{topPay.metodoPago}</h3>
                <p className="mt-2 text-[12px] leading-5 text-ds-fg-muted">El método con mayor volumen facilita conciliación y arqueo.</p>
                <strong className="ds-nums mt-4 block truncate text-xl font-semibold text-ds-fg">{fmtMoney(topPay.ingresos)}</strong>
                <span className="ds-nums text-[12px] text-ds-fg-muted">{topPay.turnos} turnos</span>
              </>
            ) : <p className="mt-3 text-sm text-ds-fg-subtle">Sin pagos en el periodo.</p>}
          </article>
        </section>
      ),
    },
    {
      id: "tablas",
      label: "Tablas de datos",
      node: (
        <section className="grid gap-5 xl:grid-cols-2">
          <article className={cardCls}>
            <div className={cardHead}>
              <div><h3 className="font-semibold text-ds-fg">Rentabilidad por servicio</h3><p className="truncate text-[12px] text-ds-fg-muted">Ingreso, costo y margen por servicio.</p></div>
              <Badge tone="neutral">{r.byService.length} servicios</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-ds-border text-[11px] uppercase tracking-wide text-ds-fg-muted">
                    <th className="px-3 py-2 font-medium">Servicio</th>
                    <th className="px-3 py-2 font-medium">Categ.</th>
                    <th className="px-3 py-2 text-right font-medium">Turnos</th>
                    <th className="px-3 py-2 text-right font-medium">Ingreso</th>
                    <th className="px-3 py-2 text-right font-medium">Costo</th>
                    <th className="px-3 py-2 text-right font-medium">Comis.</th>
                    <th className="px-3 py-2 text-right font-medium">Utilidad</th>
                    <th className="px-3 py-2 text-right font-medium">Rent.</th>
                  </tr>
                </thead>
                <tbody>
                  {r.byService.map((s) => (
                    <tr className="border-b border-ds-border last:border-0 hover:bg-ds-surface-2" key={`${s.servicio}-${s.categoria}`}>
                      <td className="max-w-[140px] truncate px-3 py-2 font-medium text-ds-fg">{s.servicio}</td>
                      <td className="max-w-[100px] truncate px-3 py-2 capitalize text-ds-fg-muted">{s.categoria.replace("_", " ")}</td>
                      <td className="ds-nums px-3 py-2 text-right">{s.turnos}</td>
                      <td className="ds-nums px-3 py-2 text-right font-medium text-ds-fg">{fmtMoney(s.ingresos)}</td>
                      <td className="ds-nums px-3 py-2 text-right text-ds-fg-muted">{fmtMoney(s.costoInsumo)}</td>
                      <td className="ds-nums px-3 py-2 text-right text-ds-fg-muted">{fmtMoney(s.comision)}</td>
                      <td className="ds-nums px-3 py-2 text-right font-semibold text-ds-fg">{fmtMoney(s.utilidadNeta)}</td>
                      <td className="px-3 py-2 text-right">
                        <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-medium ${s.rentabilidadNeta >= 0.4 ? "bg-ds-success-tint text-ds-success" : s.rentabilidadNeta >= 0.2 ? "bg-ds-warning-tint text-ds-warning" : "bg-ds-danger-tint text-ds-danger"}`}>{pct(s.rentabilidadNeta)}</span>
                      </td>
                    </tr>
                  ))}
                  {r.byService.length === 0 && <tr><td className="px-3 py-8 text-center text-ds-fg-subtle" colSpan={8}>Sin turnos en el periodo.</td></tr>}
                </tbody>
              </table>
            </div>
          </article>
          <article className={cardCls}>
            <div className={cardHead}>
              <div><h3 className="font-semibold text-ds-fg">Producción por empleado</h3><p className="truncate text-[12px] text-ds-fg-muted">Producción, costo, comisión y utilidad.</p></div>
              <Badge tone="neutral">{r.byEmployee.length} empleados</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-ds-border text-[11px] uppercase tracking-wide text-ds-fg-muted">
                    <th className="px-3 py-2 font-medium">Empleado</th>
                    <th className="px-3 py-2 font-medium">Espec.</th>
                    <th className="px-3 py-2 text-right font-medium">Turnos</th>
                    <th className="px-3 py-2 text-right font-medium">Prod.</th>
                    <th className="px-3 py-2 text-right font-medium">Costo</th>
                    <th className="px-3 py-2 text-right font-medium">Comis.</th>
                    <th className="px-3 py-2 text-right font-medium">Util.</th>
                  </tr>
                </thead>
                <tbody>
                  {r.byEmployee.map((e) => (
                    <tr className="border-b border-ds-border last:border-0 hover:bg-ds-surface-2" key={`${e.empleado}-${e.especialidad}`}>
                      <td className="max-w-[140px] truncate px-3 py-2 font-medium text-ds-fg">{e.empleado}</td>
                      <td className="max-w-[100px] truncate px-3 py-2 capitalize text-ds-fg-muted">{e.especialidad.replace("_", " ")}</td>
                      <td className="ds-nums px-3 py-2 text-right">{e.turnos}</td>
                      <td className="ds-nums px-3 py-2 text-right font-medium text-ds-fg">{fmtMoney(e.ingresos + e.propinas)}</td>
                      <td className="ds-nums px-3 py-2 text-right text-ds-fg-muted">{fmtMoney(e.costoInsumo)}</td>
                      <td className="ds-nums px-3 py-2 text-right font-medium text-ds-fg">{fmtMoney(e.comision)}</td>
                      <td className="ds-nums px-3 py-2 text-right font-semibold text-ds-success">{fmtMoney(e.utilidadNegocio)}</td>
                    </tr>
                  ))}
                  {r.byEmployee.length === 0 && <tr><td className="px-3 py-8 text-center text-ds-fg-subtle" colSpan={7}>Sin producción en el periodo.</td></tr>}
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
        <section className="grid gap-5 xl:grid-cols-[1fr_1.6fr]">
          <article className={cardCls}>
            <div className="border-b border-ds-border px-5 py-4">
              <h3 className="font-semibold text-ds-fg">Método de pago</h3>
              <p className="truncate text-[12px] text-ds-fg-muted">Distribución de caja por periodo.</p>
            </div>
            <div className="grid gap-2 p-5">
              {r.byPayment.map((p) => (
                <div className="flex items-center justify-between rounded-control border border-ds-border bg-ds-surface-2 px-4 py-3" key={p.metodoPago}>
                  <div>
                    <p className="text-[11px] font-medium capitalize text-ds-fg-muted">{p.metodoPago}</p>
                    <strong className="ds-nums text-base font-semibold text-ds-fg">{fmtMoney(p.ingresos)}</strong>
                  </div>
                  <span className="ds-nums rounded-full bg-ds-surface px-2.5 py-1 text-[12px] font-medium text-ds-fg-muted">{p.turnos} turnos</span>
                </div>
              ))}
              {r.byPayment.length === 0 && <p className="text-sm text-ds-fg-subtle">Sin pagos en el periodo.</p>}
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
    <div className="space-y-5 print:space-y-4">
      <PageHeader
        title="Reportes y rentabilidad"
        description="Ingresos, costos, márgenes, comisiones, ticket promedio y rendimiento por empleado y servicio."
        actions={
          <div className="no-print flex flex-wrap gap-2">
            {[{ label: "CSV servicios", tipo: "servicios" }, { label: "CSV empleados", tipo: "empleados" }, { label: "CSV pagos", tipo: "pagos" }].map(({ label, tipo }) => (
              <a key={tipo} className="inline-flex h-control items-center gap-1.5 rounded-control border border-ds-border-strong bg-ds-surface px-3 text-[13px] font-medium text-ds-fg transition-colors hover:bg-ds-surface-2" href={`/admin/reportes/export-csv?from=${range.from}&to=${range.to}&tipo=${tipo}`} download>
                <Download className="size-3.5" /> {label}
              </a>
            ))}
            <ExportButtons byService={r.byService} byEmployee={r.byEmployee} byPayment={r.byPayment} kpis={r.kpis} from={range.from} to={range.to} />
          </div>
        }
      />

      <div className="rounded-card border border-ds-border bg-ds-surface p-4 shadow-ds-sm">
        <DateRangePicker from={range.from} to={range.to} />
        <p className="mt-2 text-[12px] text-ds-fg-muted">Periodo activo: {range.from} — {range.to}</p>
      </div>

      <SelectableKpiGrid kpis={[
        { id: "ingresos",    label: "Ingresos",        value: fmtMoney(r.kpis.ingresos),      detail: `${r.kpis.turnos} turnos cerrados`,                     accentClass: "border-l-4 border-l-ds-primary",  icon: "$"  },
        { id: "utilidad",    label: "Utilidad neta",   value: fmtMoney(r.kpis.utilidadNeta),  detail: "Luego de insumos, gastos y comisiones",                accentClass: "border-l-4 border-l-ds-success",  icon: "UN" },
        { id: "margen",      label: "Margen bruto",    value: fmtMoney(r.kpis.margenBruto),   detail: `${fmtMoney(r.kpis.costoInsumo)} costo insumo`,        accentClass: "border-l-4 border-l-ds-primary",  icon: "MB" },
        { id: "comisiones",  label: "Comisiones",      value: fmtMoney(r.kpis.comisiones),    detail: commissionBaseLabel[r.settings.comisionBase] || "Precio final", accentClass: "border-l-4 border-l-ds-warning", icon: "%" },
        { id: "ticket",      label: "Ticket promedio", value: fmtMoney(r.kpis.ticket),        detail: `${fmtMoney(r.kpis.propinas)} propinas`,               accentClass: "border-l-4 border-l-ds-primary",  icon: "TP" },
        { id: "gastos",      label: "Gastos",          value: fmtMoney(r.kpis.gastos),        detail: "Operación del periodo",                               accentClass: "border-l-4 border-l-ds-danger",   icon: "G"  },
        { id: "costo",       label: "Costo insumo",    value: fmtMoney(r.kpis.costoInsumo),   detail: "Descuento por servicio cerrado",                      accentClass: "border-l-4 border-l-ds-fg-subtle", icon: "CI" },
        { id: "noasistencia",label: "No asistencia",   value: pct(r.kpis.tasaNoAsistencia),   detail: "Citas no asistidas sobre citas totales",              accentClass: "border-l-4 border-l-ds-warning",  icon: "NA" },
      ]} />

      <div className="relative">
        <p className="mb-2 ml-8 text-[11px] font-medium uppercase tracking-wide text-ds-fg-subtle">
          Arrastra los módulos para reordenarlos — el orden se guarda localmente
        </p>
        <DndReportLayout modules={modules} />
      </div>

      <footer className="flex flex-wrap gap-x-6 gap-y-1 border-t border-ds-border pt-4">
        <p className="text-[12px] text-ds-fg-muted"><span className="font-medium text-ds-fg">Regla de comisión:</span> {commissionBaseLabel[r.settings.comisionBase] || "Precio final"}</p>
        <p className="text-[12px] text-ds-fg-muted"><span className="font-medium text-ds-fg">Propina en comisión:</span> {r.settings.propinaEnComision ? "Incluida" : "No incluida"}</p>
        <p className="text-[12px] text-ds-fg-muted"><span className="font-medium text-ds-fg">Editable en:</span> Admin / Configuración</p>
      </footer>
    </div>
  );
}
