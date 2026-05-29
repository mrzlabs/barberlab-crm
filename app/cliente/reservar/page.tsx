import { fmtDateTime, fmtMoney, toDateInput } from "@/lib/admin/format";
import { getReservaCatalog, getSlots } from "@/lib/cliente/queries";
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
  const catalog = await getReservaCatalog();
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
      <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">Agenda publica autenticada</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight">Reserva tu cita</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Selecciona servicio, especialista, dia y hora disponible. La confirmacion queda registrada como cita reservada.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Disponibilidad</p>
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
            <button className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white" type="submit">
              Consultar slots
            </button>
          </div>
        </form>

        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <h3 className="text-2xl font-black">Horarios disponibles</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedService?.nombre || "Servicio"} con {selectedEmployee?.nombre || "especialista"}.
            </p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <form action={reservarCita} className="rounded-2xl border bg-slate-50 p-4" key={slot.inicio.toISOString()}>
                <input name="servicioId" type="hidden" value={params.servicioId} />
                <input name="empleadoId" type="hidden" value={params.empleadoId} />
                <input name="inicio" type="hidden" value={slot.inicio.toISOString()} />
                <input name="fin" type="hidden" value={slot.fin.toISOString()} />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Slot</p>
                <strong className="mt-2 block text-lg">{fmtDateTime(slot.inicio)}</strong>
                <p className="mt-1 text-sm text-muted-foreground">Finaliza {fmtDateTime(slot.fin)}</p>
                <button className="mt-4 w-full rounded-xl bg-cyan-500 px-4 py-3 text-sm font-black text-white" type="submit">
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
    </div>
  );
}
