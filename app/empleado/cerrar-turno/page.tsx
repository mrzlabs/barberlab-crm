import { fmtDateTime, fmtMoney } from "@/lib/admin/format";
import { requireRole } from "@/lib/auth/session";
import { getCitasParaCerrar, getMisTurnos } from "@/lib/empleado/queries";
import { closeMiTurno } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Select } from "@/components/ui/Input";

export const dynamic = "force-dynamic";

const lbl = "grid gap-1 text-[12px] font-medium text-ds-fg-muted";

export default async function CerrarTurnoPage() {
  const profile = await requireRole(["empleado"]);
  const [citasRaw, turnosRaw] = await Promise.all([getCitasParaCerrar(profile.id), getMisTurnos(profile.id)]);
  const citas  = JSON.parse(JSON.stringify(citasRaw))  as typeof citasRaw;
  const turnos = JSON.parse(JSON.stringify(turnosRaw)) as typeof turnosRaw;

  return (
    <div className="space-y-5">
      <PageHeader title="Cerrar turno" description="Registra el cobro de las citas que atendiste." />
      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-card border border-ds-border bg-ds-surface shadow-ds-sm">
          <div className="border-b border-ds-border p-5">
            <p className="text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Cierre de servicio</p>
            <h2 className="text-base font-semibold text-ds-fg">Mis citas pendientes</h2>
            <p className="mt-1 text-[13px] text-ds-fg-muted">Solo aparecen citas asignadas a ti.</p>
          </div>
          <div className="divide-y divide-ds-border">
            {citas.map((cita) => (
              <form action={closeMiTurno} className="grid gap-3 p-5 lg:grid-cols-6" key={cita.id}>
                <input name="citaId" type="hidden" value={cita.id} />
                <div className="lg:col-span-2">
                  <p className="font-medium text-ds-fg">{cita.cliente}</p>
                  <p className="text-[13px] text-ds-fg-muted">{cita.servicio}</p>
                  <p className="mt-1 text-[11px] font-medium uppercase text-ds-fg-subtle">{fmtDateTime(cita.inicio)}</p>
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
                  <button className="h-control w-full rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover" type="submit">Cerrar</button>
                </div>
                <label className={`${lbl} lg:col-span-2`}>Descuento
                  <Input defaultValue="0" min="0" name="descuento" type="number" />
                </label>
                <label className={`${lbl} lg:col-span-4`}>Observaciones
                  <Input name="observaciones" placeholder="Detalle del servicio realizado" />
                </label>
              </form>
            ))}
            {citas.length === 0 && <p className="p-8 text-center text-sm text-ds-fg-subtle">No hay citas pendientes para cierre.</p>}
          </div>
        </section>

        <section className="overflow-hidden rounded-card border border-ds-border bg-ds-surface shadow-ds-sm">
          <div className="border-b border-ds-border p-5">
            <h3 className="text-base font-semibold text-ds-fg">Mis turnos cerrados</h3>
            <p className="mt-1 text-[13px] text-ds-fg-muted">Últimos cierres registrados.</p>
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
            {turnos.length === 0 && <p className="p-8 text-center text-sm text-ds-fg-subtle">Sin turnos cerrados.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
