import Link from "next/link";
import { ArrowRight, CalendarPlus, Wallet } from "lucide-react";
import { fmtMoney } from "@/lib/admin/format";
import { getDashboard, getRecentTurnos } from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stat } from "@/components/ui/Stat";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

const emptyDashboard = {
  today: { turnos: 0, citas: 0, ingresos: 0, gastos: 0, costoInsumo: 0, margen: 0, propinas: 0, ticket: 0 },
  month: { turnos: 0, ingresos: 0, gastos: 0, costoInsumo: 0, margen: 0, ticket: 0 },
  lowStock: 0,
  deltaHoy: { ingresos: null, margen: null, ticket: null },
  deltaMes: { ingresos: null, margen: null },
};

function safeQuery<T>(promise: Promise<T>, fallback: T, timeoutMs = 8000): Promise<T> {
  return Promise.race([
    promise.catch(() => fallback),
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), timeoutMs)),
  ]);
}

const flow = [
  { label: "Servicios", href: "/admin/servicios", text: "precios y costos" },
  { label: "Empleados", href: "/admin/empleados", text: "roles y comisiones" },
  { label: "Agenda", href: "/admin/agenda", text: "citas por aprobar" },
  { label: "Turnos", href: "/admin/turnos", text: "caja e inventario" },
];

export default async function DashboardPage() {
  const profile = await requireRole(["admin", "super_admin"]).catch(() => null);
  const negocioId = profile?.negocioId ?? "00000000-0000-0000-0000-000000000000";

  const [dashboard, recentTurnos] = await Promise.all([
    safeQuery(getDashboard(negocioId), emptyDashboard),
    safeQuery(getRecentTurnos(negocioId), []),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resumen operativo"
        description={profile?.slogan || "Agenda, caja, inventario y rentabilidad del día en un solo lugar."}
        actions={
          <>
            <Link
              href="/admin/turnos"
              className="inline-flex h-control items-center gap-2 rounded-control border border-ds-border-strong bg-ds-surface px-4 text-sm font-medium text-ds-fg transition-colors hover:bg-ds-surface-2"
            >
              <Wallet className="size-4" /> Cerrar caja
            </Link>
            <Link
              href="/admin/agenda"
              className="inline-flex h-control items-center gap-2 rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover"
            >
              <CalendarPlus className="size-4" /> Agendar turno
            </Link>
          </>
        }
      />

      {/* KPIs del día */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="Ingresos hoy" value={fmtMoney(dashboard.today.ingresos)} detail={`${dashboard.today.turnos} turnos cerrados`} delta={dashboard.deltaHoy.ingresos} href="/admin/reportes" />
        <Stat label="Margen bruto hoy" value={fmtMoney(dashboard.today.margen)} detail={`Gastos ${fmtMoney(dashboard.today.gastos)} · Insumos ${fmtMoney(dashboard.today.costoInsumo)}`} delta={dashboard.deltaHoy.margen} href="/admin/reportes" />
        <Stat label="Ticket promedio" value={fmtMoney(dashboard.today.ticket)} detail={`${dashboard.today.citas} citas hoy`} delta={dashboard.deltaHoy.ticket} href="/admin/reportes" />
        <Stat label="Stock mínimo" value={dashboard.lowStock} detail="Items con alerta" href="/admin/inventario" />
      </section>

      {/* Caja + Flujo del día */}
      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.6fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Caja</p>
              <h2 className="text-base font-semibold text-ds-fg">Últimos turnos</h2>
            </div>
            <Link href="/admin/turnos" className="inline-flex items-center gap-1 text-[13px] font-medium text-ds-primary hover:text-ds-primary-hover">
              Ver todo <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-ds-border text-[12px] uppercase tracking-wide text-ds-fg-muted">
                  <th className="px-5 py-2.5 font-medium">Cliente</th>
                  <th className="px-5 py-2.5 font-medium">Servicio</th>
                  <th className="px-5 py-2.5 font-medium">Empleado</th>
                  <th className="px-5 py-2.5 font-medium">Método</th>
                  <th className="px-5 py-2.5 text-right font-medium">Ingreso</th>
                </tr>
              </thead>
              <tbody>
                {recentTurnos.map((turno) => (
                  <tr className="border-b border-ds-border last:border-0 hover:bg-ds-surface-2" key={turno.id}>
                    <td className="px-5 py-3 font-medium text-ds-fg">{turno.cliente}</td>
                    <td className="px-5 py-3 text-ds-fg-muted">{turno.servicio}</td>
                    <td className="px-5 py-3 text-ds-fg-muted">{turno.empleado}</td>
                    <td className="px-5 py-3 capitalize text-ds-fg-muted">{turno.metodoPago}</td>
                    <td className="ds-nums px-5 py-3 text-right font-medium text-ds-fg">{fmtMoney(Number(turno.precioFinal) + Number(turno.propina))}</td>
                  </tr>
                ))}
                {recentTurnos.length === 0 && (
                  <tr>
                    <td className="px-5 py-10 text-center text-ds-fg-subtle" colSpan={5}>Sin turnos cerrados hoy.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <p className="text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Flujo del día</p>
              <h2 className="text-base font-semibold text-ds-fg">Siguientes pasos</h2>
            </div>
            <Badge tone="success">Activo</Badge>
          </CardHeader>
          <div className="grid gap-2 p-4">
            {flow.map((item, index) => (
              <Link
                className="group flex items-center gap-3 rounded-control border border-ds-border p-2.5 transition-colors hover:border-ds-border-strong hover:bg-ds-surface-2"
                href={item.href}
                key={item.href}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ds-primary-tint text-[13px] font-semibold text-ds-primary">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-[13px] font-medium text-ds-fg">{item.label}</strong>
                  <span className="text-[12px] text-ds-fg-muted">{item.text}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-ds-fg-subtle transition-colors group-hover:text-ds-fg-muted" />
              </Link>
            ))}
          </div>
        </Card>
      </section>

      {/* Performance mensual */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-ds-fg">Performance del mes</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <Stat label="Ingresos mes" value={fmtMoney(dashboard.month.ingresos)} detail={`${dashboard.month.turnos} turnos`} delta={dashboard.deltaMes.ingresos} href="/admin/reportes" />
          <Stat label="Gastos mes" value={fmtMoney(dashboard.month.gastos)} detail={`Insumos ${fmtMoney(dashboard.month.costoInsumo)}`} href="/admin/gastos" />
          <Stat label="Margen mes" value={fmtMoney(dashboard.month.margen)} detail={`Ticket ${fmtMoney(dashboard.month.ticket)}`} delta={dashboard.deltaMes.margen} href="/admin/reportes" />
        </div>
      </section>
    </div>
  );
}
