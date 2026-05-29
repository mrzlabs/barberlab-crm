import Link from "next/link";
import { fmtMoney } from "@/lib/admin/format";
import { getDashboard, getRecentTurnos } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

function KpiCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  return (
    <article className={`glass-panel rounded-[1.6rem] p-5 ${tone}`}>
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <strong className="mt-3 block text-3xl font-black tracking-tight">{value}</strong>
      <p className="mt-2 text-sm font-semibold text-slate-600">{detail}</p>
    </article>
  );
}

const flow = [
  { label: "Servicios", href: "/admin/servicios", text: "precios y costos" },
  { label: "Empleados", href: "/admin/empleados", text: "roles y comisiones" },
  { label: "Agenda", href: "/admin/agenda", text: "citas por aprobar" },
  { label: "Turnos", href: "/admin/turnos", text: "caja e inventario" },
];

export default async function DashboardPage() {
  const [dashboard, recentTurnos] = await Promise.all([getDashboard(), getRecentTurnos()]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-violet-950/20 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(34,211,238,.34),transparent_18rem),radial-gradient(circle_at_84%_65%,rgba(168,85,247,.38),transparent_20rem)]" />
          <div className="relative">
            <div className="mac-dots" />
            <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Operacion no-code para barberias</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              Admin controla agenda, turnos, caja, inventario y rentabilidad desde una sola vista.
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-300">
              Modelo inspirado en CRM empresariales: componentes modulares, flujo visual, alarmas operativas y datos listos para tomar decisiones.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950" href="/admin/agenda">Agendar turno</Link>
              <Link className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white" href="/admin/turnos">Cerrar caja</Link>
            </div>
          </div>
        </div>

        <aside className="glass-panel rounded-[2rem] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-700">Next steps</p>
              <h3 className="mt-1 text-2xl font-black">Flujo del dia</h3>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">Activo</span>
          </div>
          <div className="mt-5 grid gap-3">
            {flow.map((item, index) => (
              <Link className="group flex items-center gap-3 rounded-2xl border bg-white p-3 transition hover:border-violet-300 hover:shadow-lg" href={item.href} key={item.href}>
                <span className="grid size-9 place-items-center rounded-xl bg-slate-950 text-sm font-black text-cyan-200 group-hover:bg-violet-700">{index + 1}</span>
                <span>
                  <strong className="block text-sm">{item.label}</strong>
                  <span className="text-xs font-semibold text-slate-500">{item.text}</span>
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Ingresos hoy" value={fmtMoney(dashboard.today.ingresos)} detail={`${dashboard.today.turnos} turnos cerrados`} tone="border-cyan-100" />
        <KpiCard label="Margen hoy" value={fmtMoney(dashboard.today.margen)} detail={`${fmtMoney(dashboard.today.gastos)} en gastos`} tone="border-violet-100" />
        <KpiCard label="Ticket promedio" value={fmtMoney(dashboard.today.ticket)} detail={`${dashboard.today.citas} citas en agenda hoy`} tone="border-emerald-100" />
        <KpiCard label="Stock minimo" value={String(dashboard.lowStock)} detail="Items con alerta activa" tone="border-amber-100" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel rounded-[2rem] p-5">
          <div className="mac-dots" />
          <h3 className="mt-5 text-2xl font-black">Performance mensual</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <KpiCard label="Ingresos mes" value={fmtMoney(dashboard.month.ingresos)} detail={`${dashboard.month.turnos} turnos`} tone="" />
            <KpiCard label="Gastos mes" value={fmtMoney(dashboard.month.gastos)} detail="Operacion" tone="" />
            <KpiCard label="Margen mes" value={fmtMoney(dashboard.month.margen)} detail={`Ticket ${fmtMoney(dashboard.month.ticket)}`} tone="" />
          </div>
        </div>

        <section className="glass-panel overflow-hidden rounded-[2rem]">
          <div className="flex items-center justify-between border-b border-slate-200/70 p-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-700">Caja</p>
              <h3 className="text-2xl font-black">Ultimos turnos</h3>
            </div>
            <Link className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white" href="/admin/turnos">Ver todo</Link>
          </div>
          <div className="overflow-x-auto scrollbar-soft">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-950 text-xs uppercase tracking-wide text-cyan-100">
                <tr>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Servicio</th>
                  <th className="px-5 py-3">Empleado</th>
                  <th className="px-5 py-3">Metodo</th>
                  <th className="px-5 py-3 text-right">Ingreso</th>
                </tr>
              </thead>
              <tbody className="bg-white/78">
                {recentTurnos.map((turno) => (
                  <tr className="border-t" key={turno.id}>
                    <td className="px-5 py-4 font-black">{turno.cliente}</td>
                    <td className="px-5 py-4">{turno.servicio}</td>
                    <td className="px-5 py-4">{turno.empleado}</td>
                    <td className="px-5 py-4 capitalize">{turno.metodoPago}</td>
                    <td className="px-5 py-4 text-right font-black">{fmtMoney(Number(turno.precioFinal) + Number(turno.propina))}</td>
                  </tr>
                ))}
                {recentTurnos.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-500" colSpan={5}>Sin turnos cerrados.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  );
}
