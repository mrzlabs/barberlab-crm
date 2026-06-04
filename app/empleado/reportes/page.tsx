import Link from "next/link";
import { fmtDateTime, fmtMoney, toDateInput } from "@/lib/admin/format";
import { requireRole } from "@/lib/auth/session";
import { getEmpleadoByUsr, getReportesEmpleado } from "@/lib/empleado/queries";

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
      <section className="rounded-xl border border-slate-700/50 bg-slate-900/80 p-6 shadow-sm">
        <h2 className="text-2xl font-black">Empleado sin perfil operativo</h2>
        <p className="mt-2 text-sm text-muted-foreground">El usuario existe, pero no tiene registro en la tabla empleados.</p>
      </section>
    );
  }

  const reporte = await getReportesEmpleado(empleado.id, desde, hasta);
  const presets = [
    { href: "/empleado/reportes?preset=hoy", label: "Hoy" },
    { href: "/empleado/reportes?preset=semana", label: "Esta semana" },
    { href: "/empleado/reportes?preset=mes", label: "Este mes" },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-violet-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,.32),transparent_18rem),radial-gradient(circle_at_86%_62%,rgba(168,85,247,.38),transparent_20rem)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Reportes propios</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{profile.nombre}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Servicios realizados, producción, comisión y ticket promedio del periodo seleccionado.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((item) => <Link className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-black text-white transition hover:bg-white/20" href={item.href} key={item.href}>{item.label}</Link>)}
          </div>
        </div>
      </section>

      <form className="glass-panel grid gap-3 rounded-[1.5rem] p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="grid gap-2 text-sm font-bold text-slate-300">Desde<input className="rounded-xl border border-slate-600/50 bg-slate-800/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" name="desde" type="date" defaultValue={desde} /></label>
        <label className="grid gap-2 text-sm font-bold text-slate-300">Hasta<input className="rounded-xl border border-slate-600/50 bg-slate-800/60 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500" name="hasta" type="date" defaultValue={hasta} /></label>
        <button className="rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-black text-white transition hover:bg-cyan-400" type="submit">Filtrar</button>
      </form>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Servicios realizados", value: String(reporte.kpis.servicios), detail: "turnos cerrados" },
          { label: "Ingresos generados", value: fmtMoney(reporte.kpis.ingresos), detail: "precio final + propinas" },
          { label: "Comisiones acumuladas", value: fmtMoney(reporte.kpis.comisiones), detail: `${reporte.comisionPct}% configurado` },
          { label: "Ticket promedio", value: fmtMoney(reporte.kpis.ticket), detail: "por servicio cerrado" },
        ].map((kpi) => (
          <article className="glass-panel overflow-hidden rounded-[1.5rem] p-5" key={kpi.label}>
            <p className="truncate text-xs font-black uppercase tracking-[0.16em] crm-text-muted">{kpi.label}</p>
            <strong className="mt-2 block truncate text-3xl font-black crm-text-primary">{kpi.value}</strong>
            <p className="mt-1 truncate text-xs crm-text-muted">{kpi.detail}</p>
          </article>
        ))}
      </section>

      <section className="glass-panel overflow-hidden rounded-[1.5rem] shadow-sm">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="min-w-0"><h3 className="truncate font-black crm-text-primary">Servicios realizados</h3><p className="truncate text-xs crm-text-muted">Periodo activo: {desde} a {hasta}</p></div>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white">{reporte.servicios.length} registros</span>
        </div>
        <div className="overflow-x-auto scrollbar-soft">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-transparent text-[10px] uppercase tracking-wide crm-text-muted"><tr><th className="px-5 py-3">Fecha</th><th className="px-5 py-3">Cliente</th><th className="px-5 py-3">Servicio</th><th className="px-4 py-3 text-right">Ingreso</th><th className="px-4 py-3 text-right">Comisión</th></tr></thead>
            <tbody>
              {reporte.servicios.map((item, i) => (
                <tr className={`border-t border-white/8 transition hover:bg-slate-800/40 ${i % 2 === 0 ? "" : "bg-slate-800/20"}`} key={item.id}>
                  <td className="px-5 py-3.5 whitespace-nowrap crm-text-primary">{fmtDateTime(item.fecha)}</td>
                  <td className="max-w-[220px] truncate px-5 py-3.5 font-semibold crm-text-primary">{item.cliente}</td>
                  <td className="max-w-[260px] truncate px-5 py-3.5 crm-text-muted">{item.servicio}</td>
                  <td className="px-4 py-3.5 text-right tabular-nums font-semibold crm-text-primary">{fmtMoney(item.ingreso)}</td>
                  <td className="px-4 py-3.5 text-right tabular-nums font-black text-violet-300">{fmtMoney(item.comision)}</td>
                </tr>
              ))}
              {reporte.servicios.length === 0 && <tr><td className="px-5 py-8 text-center text-slate-400" colSpan={5}>Sin servicios realizados en el periodo.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
