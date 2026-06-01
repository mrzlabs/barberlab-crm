import { fmtDateTime, fmtMoney } from "@/lib/admin/format";
import { getArqueoCaja, getPendingCitas, getRecentTurnos } from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth/session";
import { SubmitButton } from "@/components/layout/SubmitButton";
import { closeTurno } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500";

const metodoColor: Record<string, string> = {
  efectivo: "bg-emerald-50 text-emerald-700 border-emerald-100",
  transferencia: "bg-cyan-50 text-cyan-700 border-cyan-100",
  tarjeta: "bg-violet-50 text-violet-700 border-violet-100",
};

export default async function TurnosPage() {
  const profile = await requireRole(["admin", "super_admin"]).catch(() => null);
  const negocioId = profile?.negocioId ?? "00000000-0000-0000-0000-000000000000";

  const [citas, turnos, arqueo] = await Promise.all([
    getPendingCitas(negocioId),
    getRecentTurnos(negocioId),
    getArqueoCaja(negocioId),
  ]);

  return (
    <div className="space-y-6">

      {/* ── Arqueo de caja hoy ── */}
      <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Caja hoy</p>
            <h2 className="mt-1 text-2xl font-black">Arqueo del día</h2>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase text-muted-foreground">Total</p>
            <strong className="block text-3xl font-black">{fmtMoney(arqueo.total.ingresos)}</strong>
            <p className="text-xs text-muted-foreground">{arqueo.total.turnos} turnos · {fmtMoney(arqueo.total.propinas)} propinas</p>
          </div>
        </div>

        {arqueo.total.turnos > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {arqueo.porMetodo.map((m) => (
              <div className={`rounded-2xl border p-4 ${metodoColor[m.metodoPago] ?? "bg-slate-50 text-slate-700 border-slate-100"}`} key={m.metodoPago}>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-60 capitalize">{m.metodoPago}</p>
                <strong className="mt-1 block text-xl font-black">{fmtMoney(m.ingresos)}</strong>
                <p className="mt-1 text-xs font-semibold opacity-70">{m.turnos} turnos · {fmtMoney(m.propinas)} propinas</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Sin turnos cerrados hoy todavía.
          </p>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* ── Citas pendientes ── */}
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Cierre operativo</p>
            <h2 className="mt-1 text-2xl font-black">Citas listas para cerrar turno</h2>
            <p className="mt-2 text-sm text-muted-foreground">Al cerrar se descuentan insumos y se registra el movimiento de caja.</p>
          </div>
          <div className="divide-y">
            {citas.map((cita) => (
              <form action={closeTurno} className="grid gap-3 p-5 lg:grid-cols-6" key={cita.id}>
                <input name="citaId" type="hidden" value={cita.id} />
                <div className="lg:col-span-2">
                  <p className="font-black">{cita.cliente}</p>
                  <p className="text-sm text-muted-foreground">{cita.servicio} con {cita.empleado}</p>
                  <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">{fmtDateTime(cita.inicio)}</p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${cita.estado === "realizada" ? "bg-emerald-50 text-emerald-700" : "bg-violet-50 text-violet-700"}`}>{cita.estado}</span>
                </div>
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Precio final
                  <input className={input} defaultValue={String(cita.precio)} min="0" name="precioFinal" required type="number" />
                </label>
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Propina
                  <input className={input} defaultValue="0" min="0" name="propina" type="number" />
                </label>
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Pago
                  <select className={input} name="metodoPago" required>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </label>
                <div className="flex items-end">
                  <SubmitButton label="Cerrar" pendingLabel="Cerrando…" className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white" />
                </div>
                <label className="lg:col-span-2 text-xs font-bold uppercase text-muted-foreground">
                  Descuento
                  <input className={input} defaultValue="0" min="0" name="descuento" type="number" />
                </label>
                <label className="lg:col-span-4 text-xs font-bold uppercase text-muted-foreground">
                  Observaciones
                  <input className={input} name="observaciones" placeholder="Notas internas del turno" />
                </label>
              </form>
            ))}
            {citas.length === 0 && (
              <p className="p-8 text-center text-sm text-muted-foreground">No hay citas pendientes para cierre.</p>
            )}
          </div>
        </section>

        {/* ── Historial reciente ── */}
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <h3 className="text-lg font-black">Turnos recientes</h3>
            <p className="mt-1 text-sm text-muted-foreground">Histórico corto para control de caja.</p>
          </div>
          <div className="divide-y">
            {turnos.map((turno) => (
              <article className="p-5" key={turno.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-black">{turno.cliente}</p>
                    <p className="text-sm text-muted-foreground">{turno.servicio}</p>
                  </div>
                  <strong>{fmtMoney(Number(turno.precioFinal) + Number(turno.propina))}</strong>
                </div>
                <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{turno.metodoPago} · {fmtDateTime(turno.createdAt)}</p>
              </article>
            ))}
            {turnos.length === 0 && (
              <p className="p-8 text-center text-sm text-muted-foreground">Sin turnos registrados.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
