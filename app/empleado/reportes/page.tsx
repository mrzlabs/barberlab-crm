import Link from "next/link";
import { fmtDateTime, fmtMoney, toDateInput } from "@/lib/admin/format";
import { requireRole } from "@/lib/auth/session";
import { getEmpleadoByUsr, getReportesEmpleado } from "@/lib/empleado/queries";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stat } from "@/components/ui/Stat";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };

function pick(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function rangeFromPreset(preset?: string) {
  const now = new Date();
  if (preset === "hoy") {
    const d = toDateInput(now);
    return { desde: d, hasta: d };
  }
  if (preset === "semana") {
    const start = new Date(now);
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
    return { desde: toDateInput(start), hasta: toDateInput(now) };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { desde: toDateInput(start), hasta: toDateInput(now) };
}

export default async function ReportesEmpleadoPage({ searchParams }: PageProps) {
  const profile = await requireRole(["empleado"]);
  const empleado = await getEmpleadoByUsr(profile.id);
  const preset = pick(searchParams?.preset);
  const defaults = rangeFromPreset(preset);
  const desde = pick(searchParams?.desde) || defaults.desde;
  const hasta = pick(searchParams?.hasta) || defaults.hasta;

  if (!empleado) {
    return (
      <div className="rounded-card border border-ds-border bg-ds-surface p-6 shadow-ds-sm">
        <h2 className="text-lg font-semibold text-ds-fg">Empleado sin perfil operativo</h2>
        <p className="mt-2 text-sm text-ds-fg-muted">El usuario existe, pero no tiene registro en la tabla empleados.</p>
      </div>
    );
  }

  const reporte = await getReportesEmpleado(empleado.id, desde, hasta);
  const presets = [
    { href: "/empleado/reportes?preset=hoy", label: "Hoy" },
    { href: "/empleado/reportes?preset=semana", label: "Esta semana" },
    { href: "/empleado/reportes?preset=mes", label: "Este mes" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mis reportes"
        description="Servicios realizados, producción, comisión y ticket promedio del periodo."
        actions={
          <div className="flex flex-wrap gap-2">
            {presets.map((item) => (
              <Link className="inline-flex h-control items-center rounded-control border border-ds-border-strong bg-ds-surface px-3 text-[13px] font-medium text-ds-fg transition-colors hover:bg-ds-surface-2" href={item.href} key={item.href}>{item.label}</Link>
            ))}
          </div>
        }
      />

      <form className="grid gap-3 rounded-card border border-ds-border bg-ds-surface p-4 shadow-ds-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="grid gap-1.5 text-[13px] font-medium text-ds-fg">Desde<Input name="desde" type="date" defaultValue={desde} /></label>
        <label className="grid gap-1.5 text-[13px] font-medium text-ds-fg">Hasta<Input name="hasta" type="date" defaultValue={hasta} /></label>
        <button className="h-control rounded-control bg-ds-primary px-5 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover" type="submit">Filtrar</button>
      </form>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
        <Stat label="Servicios realizados" value={reporte.kpis.servicios} detail="turnos cerrados" />
        <Stat label="Ingresos generados" value={fmtMoney(reporte.kpis.ingresos)} detail="precio final + propinas" />
        <Stat label="Comisiones acumuladas" value={fmtMoney(reporte.kpis.comisiones)} detail={`${reporte.comisionPct}% configurado`} />
        <Stat label="Ticket promedio" value={fmtMoney(reporte.kpis.ticket)} detail="por servicio cerrado" />
      </section>

      <section className="overflow-hidden rounded-card border border-ds-border bg-ds-surface shadow-ds-sm">
        <div className="flex items-center justify-between gap-3 border-b border-ds-border px-5 py-4">
          <div className="min-w-0"><h3 className="font-semibold text-ds-fg">Servicios realizados</h3><p className="truncate text-[12px] text-ds-fg-muted">Periodo activo: {desde} a {hasta}</p></div>
          <Badge tone="neutral">{reporte.servicios.length} registros</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-ds-border text-[11px] uppercase tracking-wide text-ds-fg-muted">
                <th className="px-5 py-2.5 font-medium">Fecha</th>
                <th className="px-5 py-2.5 font-medium">Cliente</th>
                <th className="px-5 py-2.5 font-medium">Servicio</th>
                <th className="px-4 py-2.5 text-right font-medium">Ingreso</th>
                <th className="px-4 py-2.5 text-right font-medium">Comisión</th>
              </tr>
            </thead>
            <tbody>
              {reporte.servicios.map((item) => (
                <tr className="border-b border-ds-border last:border-0 hover:bg-ds-surface-2" key={item.id}>
                  <td className="whitespace-nowrap px-5 py-3 text-ds-fg-muted">{fmtDateTime(item.fecha)}</td>
                  <td className="max-w-[220px] truncate px-5 py-3 font-medium text-ds-fg">{item.cliente}</td>
                  <td className="max-w-[260px] truncate px-5 py-3 text-ds-fg-muted">{item.servicio}</td>
                  <td className="ds-nums px-4 py-3 text-right font-medium text-ds-fg">{fmtMoney(item.ingreso)}</td>
                  <td className="ds-nums px-4 py-3 text-right font-semibold text-ds-fg">{fmtMoney(item.comision)}</td>
                </tr>
              ))}
              {reporte.servicios.length === 0 && <tr><td className="px-5 py-8 text-center text-ds-fg-subtle" colSpan={5}>Sin servicios realizados en el periodo.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
