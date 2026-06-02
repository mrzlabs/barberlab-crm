import { fmtDateTime, fmtMoney } from "@/lib/admin/format";
import { requireRole } from "@/lib/auth/session";
import { getCitasParaCerrar, getMisTurnos } from "@/lib/empleado/queries";
import { closeMiTurno } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500";

export default async function CerrarTurnoPage() {
  const profile = await requireRole(["empleado"]);
  const [citas, turnos] = await Promise.all([getCitasParaCerrar(profile.id), getMisTurnos(profile.id)]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-xl border border-slate-700/50 bg-slate-900/80 shadow-lg">
        <div className="border-b p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Cierre de servicio</p>
          <h2 className="mt-1 text-2xl font-black">Mis citas pendientes</h2>
          <p className="mt-2 text-sm text-muted-foreground">Solo aparecen citas asignadas al empleado autenticado.</p>
        </div>
        <div className="divide-y">
          {citas.map((cita) => (
            <form action={closeMiTurno} className="grid gap-3 p-5 lg:grid-cols-6" key={cita.id}>
              <input name="citaId" type="hidden" value={cita.id} />
              <div className="lg:col-span-2">
                <p className="font-black">{cita.cliente}</p>
                <p className="text-sm text-muted-foreground">{cita.servicio}</p>
                <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">{fmtDateTime(cita.inicio)}</p>
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
                <button className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white" type="submit">
                  Cerrar
                </button>
              </div>
              <label className="lg:col-span-2 text-xs font-bold uppercase text-muted-foreground">
                Descuento
                <input className={input} defaultValue="0" min="0" name="descuento" type="number" />
              </label>
              <label className="lg:col-span-4 text-xs font-bold uppercase text-muted-foreground">
                Observaciones
                <input className={input} name="observaciones" placeholder="Detalle del servicio realizado" />
              </label>
            </form>
          ))}
          {citas.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No hay citas pendientes para cierre.</p> : null}
        </div>
      </section>

      <section className="rounded-xl border border-slate-700/50 bg-slate-900/80 shadow-lg">
        <div className="border-b p-5">
          <h3 className="text-lg font-black">Mis turnos cerrados</h3>
          <p className="mt-1 text-sm text-muted-foreground">Ultimos cierres registrados.</p>
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
          {turnos.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">Sin turnos cerrados.</p> : null}
        </div>
      </section>
    </div>
  );
}
