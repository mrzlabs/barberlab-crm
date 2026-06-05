import { fmtDateTime, fmtMoney } from "@/lib/admin/format";
import { getArqueoCaja, getPendingCitas, getRecentTurnos } from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth/session";
import { SubmitButton } from "@/components/layout/SubmitButton";
import { createDeposito } from "@/app/admin/agenda/actions";
import { closeTurno } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl crm-input placeholder:text-slate-500 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20";

const metodoColor: Record<string, string> = {
  efectivo: "bg-emerald-500/20 text-auto border-emerald-500/30",
  transferencia: "bg-cyan-500/20 text-auto border-cyan-500/30",
  tarjeta: "bg-violet-500/20 text-auto border-violet-500/30",
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
            <p className="text-xs font-bold uppercase crm-text-muted">Total</p>
            <strong className="block text-3xl font-black">{fmtMoney(arqueo.total.ingresos)}</strong>
            <p className="text-xs crm-text-muted">{arqueo.total.turnos} turnos · {fmtMoney(arqueo.total.propinas)} propinas</p>
          </div>
        </div>

        {arqueo.total.turnos > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {arqueo.porMetodo.map((m) => (
              <div className={`rounded-2xl border p-4 ${metodoColor[m.metodoPago] ?? "bg-white/5 text-slate-300 border-white/10"}`} key={m.metodoPago}>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-60 capitalize">{m.metodoPago}</p>
                <strong className="mt-1 block text-xl font-black">{fmtMoney(m.ingresos)}</strong>
                <p className="mt-1 text-xs font-semibold opacity-70">{m.turnos} turnos · {fmtMoney(m.propinas)} propinas</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
            Sin turnos cerrados hoy todavía.
          </p>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* ── Citas pendientes ── */}
        <section className="rounded-2xl border border-white/10 bg-white/8 backdrop-blur-md shadow-black/20">
          <div className="border-b border-white/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400">Cierre operativo</p>
            <h2 className="mt-1 text-2xl font-black">Citas listas para cerrar turno</h2>
            <p className="mt-2 text-sm text-slate-400">Al cerrar se descuentan insumos y se registra el movimiento de caja.</p>
          </div>
          <div className="divide-y divide-white/10">
            {citas.map((cita) => (
              <div key={cita.id} className="border-b border-white/10 last:border-0">
              <form action={closeTurno} className="grid gap-3 p-5 lg:grid-cols-6">
                <input name="citaId" type="hidden" value={cita.id} />
                <div className="lg:col-span-2">
                  <p className="font-black">{cita.cliente}</p>
                  <p className="text-sm text-slate-400">{cita.servicio} con {cita.empleado}</p>
                  <p className="mt-1 text-xs font-semibold uppercase text-slate-400">{fmtDateTime(cita.inicio)}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${cita.estado === "realizada" ? "bg-emerald-500/20 text-emerald-300" : "bg-violet-500/20 text-violet-300"}`}>{cita.estado}</span>
                    {(cita as any).depositoMonto && (
                      <span className="inline-block rounded-full bg-[#F5C40015] border border-[#F5C40030] px-2 py-0.5 text-[10px] font-black text-[#F5C400]">
                        💰 {fmtMoney(Number((cita as any).depositoMonto))} anticipo
                      </span>
                    )}
                  </div>
                </div>
                <label className="text-xs font-bold uppercase text-slate-400">
                  Precio final
                  <input className={input} defaultValue={String(cita.precio)} min="0" name="precioFinal" required type="number" />
                </label>
                <label className="text-xs font-bold uppercase text-slate-400">
                  Propina
                  <input className={input} defaultValue="0" min="0" name="propina" type="number" />
                </label>
                <label className="text-xs font-bold uppercase text-slate-400">
                  Pago
                  <select className={input} name="metodoPago" required>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </label>
                <div className="flex items-end">
                  <SubmitButton label="Cerrar" pendingLabel="Cerrando…" className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-auto" />
                </div>
                <label className="lg:col-span-2 text-xs font-bold uppercase text-slate-400">
                  Descuento
                  <input className={input} defaultValue="0" min="0" name="descuento" type="number" />
                </label>
                <label className="lg:col-span-4 text-xs font-bold uppercase text-slate-400">
                  Observaciones
                  <input className={input} name="observaciones" placeholder="Notas internas del turno" />
                </label>
                {(cita as any).depositoMonto && (
                  <div className="lg:col-span-6 rounded-xl bg-[#F5C40010] border border-[#F5C40025] px-4 py-2.5 text-sm text-[#F5C400]">
                    ⚡ Anticipo recibido de <strong>{fmtMoney(Number((cita as any).depositoMonto))}</strong> — se aplicará automáticamente al cerrar el turno.
                  </div>
                )}
              </form>

              {/* Form depósito rápido (si no tiene) */}
              {!(cita as any).depositoMonto && (
                <form action={createDeposito} className="grid gap-3 px-5 pb-5 sm:grid-cols-4 border-t border-white/5 pt-4">
                  <input name="citaId"    type="hidden" value={cita.id} />
                  <input name="clienteId" type="hidden" value={(cita as any).clienteId ?? ""} />
                  <p className="sm:col-span-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Registrar anticipo (opcional)</p>
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Monto anticipo
                    <input className={input} name="monto" min="1" type="number" placeholder="50000" />
                  </label>
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Método
                    <select className={input} name="metodoPago">
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="tarjeta">Tarjeta</option>
                    </select>
                  </label>
                  <label className="text-xs font-bold uppercase text-slate-400">
                    Notas
                    <input className={input} name="notas" placeholder="Descripción del anticipo" />
                  </label>
                  <div className="flex items-end">
                    <SubmitButton label="Registrar anticipo" pendingLabel="Registrando…"
                      className="w-full rounded-xl border border-[#F5C40040] bg-transparent px-3 py-2.5 text-sm font-black text-[#F5C400] hover:bg-[#F5C40015]" />
                  </div>
                </form>
              )}
              </div>
            ))}
            {citas.length === 0 && (
              <p className="p-8 text-center text-sm text-slate-400">No hay citas pendientes para cierre.</p>
            )}
          </div>
        </section>

        {/* ── Historial reciente ── */}
        <section className="rounded-2xl border border-white/10 bg-white/8 backdrop-blur-md shadow-black/20">
          <div className="border-b border-white/10 p-5">
            <h3 className="text-lg font-black">Turnos recientes</h3>
            <p className="mt-1 text-sm text-slate-400">Histórico corto para control de caja.</p>
          </div>
          <div className="divide-y divide-white/10">
            {turnos.map((turno) => (
              <article className="p-5" key={turno.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-black">{turno.cliente}</p>
                    <p className="text-sm text-slate-400">{turno.servicio}</p>
                  </div>
                  <strong>{fmtMoney(Number(turno.precioFinal) + Number(turno.propina))}</strong>
                </div>
                <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">{turno.metodoPago} · {fmtDateTime(turno.createdAt)}</p>
              </article>
            ))}
            {turnos.length === 0 && (
              <p className="p-8 text-center text-sm text-slate-400">Sin turnos registrados.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
