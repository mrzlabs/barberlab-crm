import { fmtDateTime, fmtMoney } from "@/lib/admin/format";
import { getArqueoCaja, getPendingCitas, getRecentTurnos } from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth/session";
import { SubmitButton } from "@/components/layout/SubmitButton";
import { createDeposito } from "@/app/admin/agenda/actions";
import { closeTurno } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Select } from "@/components/ui/Input";

export const dynamic = "force-dynamic";

const lbl = "grid gap-1 text-[12px] font-medium text-ds-fg-muted";
const metodoTone: Record<string, string> = {
  efectivo: "border-ds-success/30 bg-ds-success-tint",
  transferencia: "border-ds-primary/25 bg-ds-primary-tint",
  tarjeta: "border-ds-border bg-ds-surface-2",
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
    <div className="space-y-5">
      <PageHeader title="Turnos y caja" description="Cierre de citas realizadas y arqueo del día." />

      {/* Arqueo de caja hoy */}
      <section className="rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Caja hoy</p>
            <h2 className="text-base font-semibold text-ds-fg">Arqueo del día</h2>
          </div>
          <div className="text-right">
            <p className="text-[12px] font-medium uppercase text-ds-fg-muted">Total</p>
            <strong className="ds-nums block text-2xl font-semibold text-ds-fg">{fmtMoney(arqueo.total.ingresos)}</strong>
            <p className="ds-nums text-[12px] text-ds-fg-muted">{arqueo.total.turnos} turnos · {fmtMoney(arqueo.total.propinas)} propinas</p>
          </div>
        </div>

        {arqueo.total.turnos > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {arqueo.porMetodo.map((m) => (
              <div className={`rounded-control border p-4 ${metodoTone[m.metodoPago] ?? "border-ds-border bg-ds-surface-2"}`} key={m.metodoPago}>
                <p className="text-[11px] font-medium uppercase tracking-wide capitalize text-ds-fg-muted">{m.metodoPago}</p>
                <strong className="ds-nums mt-1 block text-lg font-semibold text-ds-fg">{fmtMoney(m.ingresos)}</strong>
                <p className="ds-nums mt-1 text-[12px] text-ds-fg-muted">{m.turnos} turnos · {fmtMoney(m.propinas)} propinas</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-control border border-dashed border-ds-border p-6 text-center text-sm text-ds-fg-subtle">
            Sin turnos cerrados hoy todavía.
          </p>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Citas pendientes de cierre */}
        <section className="overflow-hidden rounded-card border border-ds-border bg-ds-surface shadow-ds-sm">
          <div className="border-b border-ds-border p-5">
            <p className="text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Cierre operativo</p>
            <h2 className="text-base font-semibold text-ds-fg">Citas listas para cerrar turno</h2>
            <p className="mt-1 text-[13px] text-ds-fg-muted">Al cerrar se descuentan insumos y se registra el movimiento de caja.</p>
          </div>
          <div className="divide-y divide-ds-border">
            {citas.map((cita) => (
              <div key={cita.id}>
                <form action={closeTurno} className="grid gap-3 p-5 lg:grid-cols-6">
                  <input name="citaId" type="hidden" value={cita.id} />
                  <div className="lg:col-span-2">
                    <p className="font-medium text-ds-fg">{cita.cliente}</p>
                    <p className="text-[13px] text-ds-fg-muted">{cita.servicio} con {cita.empleado}</p>
                    <p className="mt-1 text-[11px] font-medium uppercase text-ds-fg-subtle">{fmtDateTime(cita.inicio)}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${cita.estado === "realizada" ? "bg-ds-success-tint text-ds-success" : "bg-ds-primary-tint text-ds-primary"}`}>{cita.estado}</span>
                      {(cita as any).depositoMonto && (
                        <span className="ds-nums inline-block rounded-full border border-ds-warning/30 bg-ds-warning-tint px-2 py-0.5 text-[11px] font-medium text-ds-warning">
                          {fmtMoney(Number((cita as any).depositoMonto))} anticipo
                        </span>
                      )}
                    </div>
                  </div>
                  <label className={lbl}>Precio final
                    <Input defaultValue={String(cita.precio)} min="0" name="precioFinal" required type="number" />
                  </label>
                  <label className={lbl}>Propina
                    <Input defaultValue="0" min="0" name="propina" type="number" />
                  </label>
                  <label className={lbl}>Pago
                    <Select name="metodoPago" required>
                      <option value="efectivo">Efectivo</option>
                      <option value="transferencia">Transferencia</option>
                      <option value="tarjeta">Tarjeta</option>
                    </Select>
                  </label>
                  <div className="flex items-end">
                    <SubmitButton label="Cerrar" pendingLabel="Cerrando…" className="h-control w-full rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover" />
                  </div>
                  <label className={`${lbl} lg:col-span-2`}>Descuento
                    <Input defaultValue="0" min="0" name="descuento" type="number" />
                  </label>
                  <label className={`${lbl} lg:col-span-4`}>Observaciones
                    <Input name="observaciones" placeholder="Notas internas del turno" />
                  </label>
                  {(cita as any).depositoMonto && (
                    <div className="ds-nums rounded-control border border-ds-warning/25 bg-ds-warning-tint px-4 py-2.5 text-[13px] text-ds-warning lg:col-span-6">
                      Anticipo recibido de <strong>{fmtMoney(Number((cita as any).depositoMonto))}</strong> — se aplicará automáticamente al cerrar el turno.
                    </div>
                  )}
                </form>

                {!(cita as any).depositoMonto && (
                  <form action={createDeposito} className="grid gap-3 border-t border-ds-border px-5 pb-5 pt-4 sm:grid-cols-4">
                    <input name="citaId" type="hidden" value={cita.id} />
                    <input name="clienteId" type="hidden" value={(cita as any).clienteId ?? ""} />
                    <p className="text-[11px] font-medium uppercase tracking-wide text-ds-fg-subtle sm:col-span-4">Registrar anticipo (opcional)</p>
                    <label className={lbl}>Monto anticipo
                      <Input name="monto" min="1" type="number" placeholder="50000" />
                    </label>
                    <label className={lbl}>Método
                      <Select name="metodoPago">
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta">Tarjeta</option>
                      </Select>
                    </label>
                    <label className={lbl}>Notas
                      <Input name="notas" placeholder="Descripción del anticipo" />
                    </label>
                    <div className="flex items-end">
                      <SubmitButton label="Registrar anticipo" pendingLabel="Registrando…" className="h-control w-full rounded-control border border-ds-border-strong bg-ds-surface px-3 text-sm font-medium text-ds-fg transition-colors hover:bg-ds-surface-2" />
                    </div>
                  </form>
                )}
              </div>
            ))}
            {citas.length === 0 && (
              <p className="p-8 text-center text-sm text-ds-fg-subtle">No hay citas pendientes para cierre.</p>
            )}
          </div>
        </section>

        {/* Historial reciente */}
        <section className="overflow-hidden rounded-card border border-ds-border bg-ds-surface shadow-ds-sm">
          <div className="border-b border-ds-border p-5">
            <h3 className="text-base font-semibold text-ds-fg">Turnos recientes</h3>
            <p className="mt-1 text-[13px] text-ds-fg-muted">Histórico corto para control de caja.</p>
          </div>
          <div className="divide-y divide-ds-border">
            {turnos.map((turno) => (
              <article className="px-5 py-4" key={turno.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-ds-fg">{turno.cliente}</p>
                    <p className="text-[13px] text-ds-fg-muted">{turno.servicio}</p>
                  </div>
                  <strong className="ds-nums text-sm font-semibold text-ds-fg">{fmtMoney(Number(turno.precioFinal) + Number(turno.propina))}</strong>
                </div>
                <p className="mt-1.5 text-[12px] uppercase tracking-wide text-ds-fg-subtle">{turno.metodoPago} · {fmtDateTime(turno.createdAt)}</p>
              </article>
            ))}
            {turnos.length === 0 && (
              <p className="p-8 text-center text-sm text-ds-fg-subtle">Sin turnos registrados.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
