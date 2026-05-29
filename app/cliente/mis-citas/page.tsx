import Link from "next/link";
import { fmtDateTime, fmtMoney, toDateInput } from "@/lib/admin/format";
import { requireRole } from "@/lib/auth/session";
import { getHistorialCliente, getMisCitas, getReservaCatalog, getSlots } from "@/lib/cliente/queries";
import { buscarSlotsSchema } from "@/lib/validations/cliente";
import { cancelarCita, reprogramarCita } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function estadoClass(estado: string) {
  if (estado === "realizada") return "bg-emerald-50 text-emerald-700";
  if (estado === "cancelada" || estado === "no_asistio") return "bg-red-50 text-red-700";
  if (estado === "confirmada") return "bg-violet-50 text-violet-700";
  return "bg-cyan-50 text-cyan-700";
}

function estadoDetalle(estado: string) {
  if (estado === "reservada") return "Tu cita fue solicitada. El comercio debe confirmarla.";
  if (estado === "confirmada") return "Tu cita esta confirmada. Asiste en el horario indicado.";
  if (estado === "realizada") return "Servicio atendido y cerrado.";
  if (estado === "cancelada") return "La cita fue cancelada.";
  if (estado === "no_asistio") return "La cita quedo marcada como no asistida.";
  return "Estado operativo de la cita.";
}

export default async function MisCitasPage({ searchParams }: PageProps) {
  const profile = await requireRole(["cliente"]);
  const [{ citas }, catalog, historial] = await Promise.all([getMisCitas(profile.id), getReservaCatalog(), getHistorialCliente(profile.id)]);
  const citaReprogramar = getParam(searchParams?.citaId);
  const params = buscarSlotsSchema.parse({
    servicioId: getParam(searchParams?.servicioId) || catalog.servicios[0]?.id,
    empleadoId: getParam(searchParams?.empleadoId) || catalog.empleados[0]?.id,
    fecha: getParam(searchParams?.fecha) || toDateInput(),
  });
  const slots = citaReprogramar ? await getSlots(params.empleadoId, params.fecha, params.servicioId) : [];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-violet-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(34,211,238,.32),transparent_18rem),radial-gradient(circle_at_82%_45%,rgba(168,85,247,.34),transparent_22rem)]" />
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mac-dots" />
            <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Historial cliente</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Mis citas</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Consulta, cancela o reprograma citas. Las citas realizadas quedan bloqueadas para cambios.
            </p>
          </div>
          <Link className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950" href="/cliente/reservar">
            Nueva reserva
          </Link>
        </div>
      </section>

      {citaReprogramar ? (
        <section className="glass-panel rounded-[2rem]">
          <div className="border-b border-slate-200/70 p-5">
            <h3 className="text-2xl font-black">Reprogramar cita</h3>
            <p className="mt-1 text-sm text-muted-foreground">Selecciona nueva combinacion y confirma un slot disponible.</p>
          </div>
          <form className="grid gap-4 p-5 md:grid-cols-4">
            <input name="citaId" type="hidden" value={citaReprogramar} />
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Servicio
              <select className={input} defaultValue={params.servicioId} name="servicioId" required>
                {catalog.servicios.map((service) => (
                  <option key={service.id} value={service.id}>{service.nombre}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Especialista
              <select className={input} defaultValue={params.empleadoId} name="empleadoId" required>
                {catalog.empleados.map((employee) => (
                  <option key={employee.id} value={employee.id}>{employee.nombre}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Fecha
              <input className={input} defaultValue={params.fecha} min={toDateInput()} name="fecha" required type="date" />
            </label>
            <div className="flex items-end">
              <button className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white" type="submit">
                Buscar
              </button>
            </div>
          </form>
          <div className="grid gap-3 p-5 pt-0 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <form action={reprogramarCita} className="rounded-2xl border bg-slate-50 p-4" key={slot.inicio.toISOString()}>
                <input name="citaId" type="hidden" value={citaReprogramar} />
                <input name="servicioId" type="hidden" value={params.servicioId} />
                <input name="empleadoId" type="hidden" value={params.empleadoId} />
                <input name="inicio" type="hidden" value={slot.inicio.toISOString()} />
                <input name="fin" type="hidden" value={slot.fin.toISOString()} />
                <strong className="block text-lg">{fmtDateTime(slot.inicio)}</strong>
                <p className="mt-1 text-sm text-muted-foreground">Finaliza {fmtDateTime(slot.fin)}</p>
                <button className="mt-4 w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-black text-white" type="submit">
                  Confirmar cambio
                </button>
              </form>
            ))}
            {slots.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
                Sin slots para reprogramar con la seleccion actual.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="flex gap-4 overflow-x-auto pb-2 scrollbar-soft">
        {citas.map((cita) => {
          const bloqueada = cita.estado === "realizada" || cita.estado === "cancelada" || cita.estado === "no_asistio";
          return (
            <article className="glass-panel min-w-[300px] rounded-[1.7rem] p-5 transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl sm:min-w-[350px]" key={cita.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{fmtDateTime(cita.inicio)}</p>
                  <h3 className="mt-2 text-xl font-black">{cita.servicio}</h3>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${estadoClass(cita.estado)}`}>{cita.estado}</span>
              </div>
              <dl className="mt-5 grid gap-3 text-sm">
                <div className={`rounded-2xl p-3 text-sm font-semibold ${estadoClass(cita.estado)}`}>
                  {estadoDetalle(cita.estado)}
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Especialista</dt>
                  <dd className="font-semibold text-right">{cita.empleado}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Duracion</dt>
                  <dd className="font-semibold">{cita.duracionMin} min</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Precio base</dt>
                  <dd className="font-semibold">{fmtMoney(cita.precio)}</dd>
                </div>
              </dl>
              {!bloqueada ? (
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <Link
                    className="rounded-2xl border bg-white px-4 py-3 text-center text-sm font-black"
                    href={`/cliente/mis-citas?citaId=${cita.id}&servicioId=${cita.servicioId}&empleadoId=${cita.empleadoId}&fecha=${toDateInput(new Date(cita.inicio))}`}
                  >
                    Reprogramar
                  </Link>
                  <form action={cancelarCita}>
                    <input name="citaId" type="hidden" value={cita.id} />
                    <button className="w-full rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700" type="submit">
                      Cancelar
                    </button>
                  </form>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      {citas.length === 0 ? (
        <section className="rounded-2xl border bg-white p-8 text-center text-sm text-muted-foreground shadow-sm">
          No tienes citas registradas.
        </section>
      ) : null}

      <section className="glass-panel rounded-[2rem] p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Historial</p>
            <h3 className="mt-1 text-2xl font-black">Movimientos de tus citas</h3>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {historial.map((item) => (
            <article className="rounded-2xl border bg-white p-4 text-sm shadow-sm" key={item.id}>
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div>
                  <strong className="block">{item.servicio}</strong>
                  <span className="text-slate-500">{item.detalle || item.accion}</span>
                </div>
                <span className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{fmtDateTime(item.createdAt)}</span>
              </div>
              <p className="mt-2 text-xs font-bold text-slate-500">
                {item.estadoAnterior || "inicio"} → {item.estadoNuevo || "sin cambio"}
              </p>
            </article>
          ))}
          {historial.length === 0 ? (
            <p className="rounded-2xl border border-dashed bg-white/70 p-6 text-center text-sm font-semibold text-slate-500">
              Aun no hay movimientos registrados.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
