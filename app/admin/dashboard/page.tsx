import Link from "next/link";
import { fmtMoney } from "@/lib/admin/format";
import { getDashboard, getRecentTurnos } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

function KpiCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <strong className="mt-3 block text-2xl font-black tracking-tight">{value}</strong>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </article>
  );
}

export default async function DashboardPage() {
  const [dashboard, recentTurnos] = await Promise.all([getDashboard(), getRecentTurnos()]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">Operacion diaria</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Control administrativo BarberLab</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Lectura de turnos, ingresos, gastos, margen operativo, ticket promedio y alertas de inventario.
            </p>
          </div>
          <Link className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950" href="/admin/turnos">
            Cerrar turno
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Ingresos hoy" value={fmtMoney(dashboard.today.ingresos)} detail={`${dashboard.today.turnos} turnos cerrados`} />
        <KpiCard label="Margen hoy" value={fmtMoney(dashboard.today.margen)} detail={`${fmtMoney(dashboard.today.gastos)} en gastos`} />
        <KpiCard label="Ticket promedio" value={fmtMoney(dashboard.today.ticket)} detail={`${dashboard.today.citas} citas en agenda hoy`} />
        <KpiCard label="Stock minimo" value={String(dashboard.lowStock)} detail="Items con alerta activa" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <KpiCard label="Ingresos mes" value={fmtMoney(dashboard.month.ingresos)} detail={`${dashboard.month.turnos} turnos del periodo`} />
        <KpiCard label="Gastos mes" value={fmtMoney(dashboard.month.gastos)} detail="Operacion registrada" />
        <KpiCard label="Margen mes" value={fmtMoney(dashboard.month.margen)} detail={`Ticket mes ${fmtMoney(dashboard.month.ticket)}`} />
      </section>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h3 className="text-lg font-black">Ultimos turnos</h3>
          <p className="mt-1 text-sm text-muted-foreground">Control rapido de ingresos y metodos de pago.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Servicio</th>
                <th className="px-5 py-3">Empleado</th>
                <th className="px-5 py-3">Metodo</th>
                <th className="px-5 py-3 text-right">Ingreso</th>
              </tr>
            </thead>
            <tbody>
              {recentTurnos.map((turno) => (
                <tr className="border-t" key={turno.id}>
                  <td className="px-5 py-4 font-semibold">{turno.cliente}</td>
                  <td className="px-5 py-4">{turno.servicio}</td>
                  <td className="px-5 py-4">{turno.empleado}</td>
                  <td className="px-5 py-4 capitalize">{turno.metodoPago}</td>
                  <td className="px-5 py-4 text-right font-black">{fmtMoney(Number(turno.precioFinal) + Number(turno.propina))}</td>
                </tr>
              ))}
              {recentTurnos.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-muted-foreground" colSpan={5}>
                    Sin turnos cerrados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
