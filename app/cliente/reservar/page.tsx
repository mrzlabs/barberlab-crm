import { fmtDateTime, fmtMoney, toDateInput } from "@/lib/admin/format";
import { getProductosCliente, getReservaCatalog, getSlots } from "@/lib/cliente/queries";
import { buscarSlotsSchema } from "@/lib/validations/cliente";
import { reservarCita } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ReservarPage({ searchParams }: PageProps) {
  const [catalog, products] = await Promise.all([getReservaCatalog(), getProductosCliente()]);
  const params = buscarSlotsSchema.parse({
    servicioId: getParam(searchParams?.servicioId) || catalog.servicios[0]?.id,
    empleadoId: getParam(searchParams?.empleadoId) || catalog.empleados[0]?.id,
    fecha: getParam(searchParams?.fecha) || toDateInput(),
  });
  const slots = await getSlots(params.empleadoId, params.fecha, params.servicioId);
  const selectedService = catalog.servicios.find((service) => service.id === params.servicioId);
  const selectedEmployee = catalog.empleados.find((employee) => employee.id === params.empleadoId);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-violet-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(34,211,238,.35),transparent_18rem),radial-gradient(circle_at_80%_40%,rgba(168,85,247,.38),transparent_22rem)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="mac-dots" />
            <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Agenda cliente</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Reserva, revisa disponibilidad y separa tu cita.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              El cliente consulta horarios libres por servicio y especialista. La cita queda reservada para aprobacion operativa del comercio.
            </p>
          </div>
          <div className="rounded-[1.7rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Estado</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-black">
              <span className="rounded-2xl bg-cyan-300 p-3 text-slate-950">Buscar</span>
              <span className="rounded-2xl bg-white/10 p-3">Reservar</span>
              <span className="rounded-2xl bg-white/10 p-3">Aprobar</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[390px_1fr]">
        <form className="glass-panel h-fit rounded-[2rem] p-5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Disponibilidad</p>
          <h3 className="mt-1 text-2xl font-black">Buscar horario</h3>
          <div className="mt-5 grid gap-4">
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Servicio
              <select className={input} defaultValue={params.servicioId} name="servicioId" required>
                {catalog.servicios.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.nombre} · {fmtMoney(service.precio)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Especialista
              <select className={input} defaultValue={params.empleadoId} name="empleadoId" required>
                {catalog.empleados.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.nombre} · {employee.especialidad.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Fecha
              <input className={input} defaultValue={params.fecha} min={toDateInput()} name="fecha" required type="date" />
            </label>
            <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white" type="submit">
              Consultar slots
            </button>
          </div>
        </form>

        <section className="glass-panel overflow-hidden rounded-[2rem]">
          <div className="border-b border-slate-200/70 p-5">
            <h3 className="text-2xl font-black">Horarios disponibles</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedService?.nombre || "Servicio"} con {selectedEmployee?.nombre || "especialista"}.
            </p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <form action={reservarCita} className="rounded-[1.4rem] border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl" key={slot.inicio.toISOString()}>
                <input name="servicioId" type="hidden" value={params.servicioId} />
                <input name="empleadoId" type="hidden" value={params.empleadoId} />
                <input name="inicio" type="hidden" value={slot.inicio.toISOString()} />
                <input name="fin" type="hidden" value={slot.fin.toISOString()} />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Slot</p>
                <strong className="mt-2 block text-lg">{fmtDateTime(slot.inicio)}</strong>
                <p className="mt-1 text-sm text-muted-foreground">Finaliza {fmtDateTime(slot.fin)}</p>
                <button className="mt-4 w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-black text-white" type="submit">
                  Reservar
                </button>
              </form>
            ))}
            {slots.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
                Sin horarios disponibles para la seleccion actual.
              </p>
            ) : null}
          </div>
        </section>
      </section>

      <section className="glass-panel rounded-[2rem] p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Productos disponibles</p>
            <h3 className="mt-1 text-2xl font-black">Compra manual en sede o por WhatsApp</h3>
          </div>
          <a className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white" href="https://wa.me/573503803010" target="_blank">
            Consultar por WhatsApp
          </a>
        </div>
        <div className="mt-5 flex gap-3 overflow-x-auto pb-2 scrollbar-soft">
          {products.map((item) => (
            <article className="min-w-[230px] rounded-[1.4rem] border bg-white p-4 shadow-sm" key={item.id}>
              <div className="h-24 rounded-2xl bg-[radial-gradient(circle_at_24%_28%,rgba(34,211,238,.35),transparent_5rem),linear-gradient(135deg,#0f172a,#312e81)]" />
              <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-cyan-700">{item.categoria}</p>
              <h4 className="mt-1 text-lg font-black">{item.nombre}</h4>
              <p className="mt-2 text-sm font-black text-slate-600">{fmtMoney(item.precioVenta)} · stock {item.stock} {item.unidad}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
