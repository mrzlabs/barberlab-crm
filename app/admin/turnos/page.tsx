import { fmtDateTime, fmtMoney } from "@/lib/admin/format";
import { getPendingCitas, getRecentTurnos } from "@/lib/admin/queries";
import { closeTurno } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500";

export default async function TurnosPage() {
  const [citas, turnos] = await Promise.all([getPendingCitas(), getRecentTurnos()]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Cierre operativo</p>
          <h2 className="mt-1 text-2xl font-black">Citas listas para cerrar turno</h2>
          <p className="mt-2 text-sm text-muted-foreground">Al cerrar, Supabase descuenta insumos y registra movimientos ligados a la cita.</p>
        </div>
        <div className="divide-y">
          {citas.map((cita) => (
            <form action={closeTurno} className="grid gap-3 p-5 lg:grid-cols-6" key={cita.id}>
              <input name="citaId" type="hidden" value={cita.id} />
              <div className="lg:col-span-2">
                <p className="font-black">{cita.cliente}</p>
                <p className="text-sm text-muted-foreground">{cita.servicio} con {cita.empleado}</p>
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
                <input className={input} name="observaciones" placeholder="Notas internas del turno" />
              </label>
            </form>
          ))}
          {citas.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">No hay citas pendientes para cierre.</p> : null}
        </div>
      </section>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h3 className="text-lg font-black">Turnos recientes</h3>
          <p className="mt-1 text-sm text-muted-foreground">Historico corto para control de caja.</p>
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
          {turnos.length === 0 ? <p className="p-8 text-center text-sm text-muted-foreground">Sin turnos registrados.</p> : null}
        </div>
      </section>
    </div>
  );
}
