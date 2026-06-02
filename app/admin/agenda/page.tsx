import Link from "next/link";
import { fmtDateTime, toDateInput } from "@/lib/admin/format";
import { getAgendaAdmin, getAgendaDia, getBloqueosAdmin, getClientesAdmin, getEmpleadosAdmin, getHorariosAdmin, getServiciosAdmin } from "@/lib/admin/catalog";
import { getSlots } from "@/lib/cliente/queries";
import { AgendaCalendar } from "@/components/admin/AgendaCalendar";
import { ConfirmForm } from "@/components/layout/ConfirmForm";
import { SubmitButton } from "@/components/layout/SubmitButton";
import { createBloqueoEmpleado, createCitaAdmin, createHorarioEmpleado, deleteBloqueo, deleteHorario, reagendarCita, updateCitaAdmin } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white/80 px-3 py-2 text-sm outline-none focus:border-cyan-500";
const days = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function badge(estado: string) {
  if (estado === "realizada") return "bg-emerald-50 text-emerald-700";
  if (estado === "cancelada" || estado === "no_asistio") return "bg-red-50 text-red-700";
  if (estado === "confirmada") return "bg-violet-50 text-violet-700";
  return "bg-cyan-50 text-cyan-700";
}

function isUuid(value?: string) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function prevDay(fecha: string) {
  const d = new Date(`${fecha}T12:00:00`);
  d.setDate(d.getDate() - 1);
  return toDateInput(d);
}
function nextDay(fecha: string) {
  const d = new Date(`${fecha}T12:00:00`);
  d.setDate(d.getDate() + 1);
  return toDateInput(d);
}

export default async function AdminAgendaPage({ searchParams }: PageProps) {
  const vista = getParam(searchParams?.vista) ?? "lista";
  const fecha = getParam(searchParams?.fecha) || toDateInput();

  const [citas, servicios, empleados, clientes, horarios, bloqueos] = await Promise.all([
    getAgendaAdmin(),
    getServiciosAdmin(),
    getEmpleadosAdmin(),
    getClientesAdmin(),
    getHorariosAdmin(),
    getBloqueosAdmin(),
  ]);

  const citasCalendario = vista === "calendario" ? await getAgendaDia(fecha) : [];

  const mover = getParam(searchParams?.mover);
  const citaMover = mover ? citas.find((c) => c.id === mover) : null;

  const servicioId = citaMover?.servicioId ?? getParam(searchParams?.servicioId) ?? servicios[0]?.id;
  const empleadoId = citaMover?.empleadoId ?? getParam(searchParams?.empleadoId) ?? empleados[0]?.id;
  const clienteId = getParam(searchParams?.clienteId) || clientes[0]?.id;
  const slots = isUuid(servicioId) && isUuid(empleadoId) ? await getSlots(empleadoId, fecha, servicioId) : [];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-violet-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(34,211,238,.34),transparent_18rem),radial-gradient(circle_at_78%_35%,rgba(168,85,247,.35),transparent_22rem)]" />
        <div className="relative">
          <div className="mac-dots" />
          <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Agenda completa</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Operacion por especialista</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 crm-text-secondary">
            Admin crea citas, configura disponibilidad, bloquea espacios y controla toda la agenda del comercio.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href="#nueva-cita"
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-200 transition"
            >
              + Nueva cita
            </a>
            <a
              href="#slots"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/15 transition"
            >
              Ver disponibilidad
            </a>
          </div>
        </div>
      </section>

      {/* ── Toggle vista + navegación fecha ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Link
            className={`rounded-xl px-4 py-2 text-sm font-black transition ${vista === "lista" ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700"}`}
            href={`/admin/agenda?vista=lista&fecha=${fecha}`}
          >
            Lista
          </Link>
          <Link
            className={`rounded-xl px-4 py-2 text-sm font-black transition ${vista === "calendario" ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700"}`}
            href={`/admin/agenda?vista=calendario&fecha=${fecha}`}
          >
            Calendario
          </Link>
        </div>
        {vista === "calendario" && (
          <div className="flex items-center gap-2">
            <Link className="rounded-xl border bg-white px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50" href={`/admin/agenda?vista=calendario&fecha=${prevDay(fecha)}`}>←</Link>
            <span className="text-sm font-black">{fecha}</span>
            <Link className="rounded-xl border bg-white px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50" href={`/admin/agenda?vista=calendario&fecha=${nextDay(fecha)}`}>→</Link>
            <Link className="rounded-xl bg-cyan-500 px-3 py-2 text-xs font-black text-white hover:bg-cyan-400" href={`/admin/agenda?vista=calendario&fecha=${toDateInput()}`}>Hoy</Link>
          </div>
        )}
      </div>

      {/* ── Vista calendario ── */}
      {vista === "calendario" && (
        <AgendaCalendar
          citas={citasCalendario}
          empleados={empleados.map((e) => ({ id: e.id, nombre: e.nombre }))}
        />
      )}

      {/* ── Vista lista ── */}
      {vista !== "calendario" && <section className="grid gap-4 xl:grid-cols-[410px_1fr]">
        <div className="space-y-4">
          <form className="glass-panel rounded-[2rem] p-5" id="nueva-cita">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">Crear cita admin</p>
            <h3 className="mt-1 text-2xl font-black">Nueva cita</h3>
            <div className="mt-5 grid gap-4">
              <label className="text-xs font-bold uppercase text-slate-500">
                Cliente
                <select className={input} defaultValue={clienteId} name="clienteId" required>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nombre} · {cliente.telefono}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold uppercase text-slate-500">
                Servicio
                <select className={input} defaultValue={servicioId} name="servicioId" required>
                  {servicios.map((servicio) => (
                    <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold uppercase text-slate-500">
                Especialista
                <select className={input} defaultValue={empleadoId} name="empleadoId" required>
                  {empleados.map((empleado) => (
                    <option key={empleado.id} value={empleado.id}>{empleado.nombre} · {empleado.especialidad.replace("_", " ")}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold uppercase text-slate-500">
                Fecha
                <input className={input} defaultValue={fecha} min={toDateInput()} name="fecha" required type="date" />
              </label>
              <SubmitButton label="Consultar horarios" pendingLabel="Buscando…" className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white" />
            </div>
          </form>

          <form action={createHorarioEmpleado} className="glass-panel rounded-[2rem] p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Disponibilidad</p>
            <h3 className="mt-1 text-2xl font-black">Agregar horario</h3>
            <div className="mt-5 grid gap-3">
              <select className={input} name="empleadoId" required>
                {empleados.map((empleado) => (
                  <option key={empleado.id} value={empleado.id}>{empleado.nombre}</option>
                ))}
              </select>
              <select className={input} name="diaSemana" required>
                {days.map((day, index) => (
                  <option key={day} value={index}>{day}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input className={input} name="horaInicio" required type="time" />
                <input className={input} name="horaFin" required type="time" />
              </div>
              <SubmitButton label="Guardar horario" pendingLabel="Guardando…" className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white" />
            </div>
          </form>

          <form action={createBloqueoEmpleado} className="glass-panel rounded-[2rem] p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Bloqueos</p>
            <h3 className="mt-1 text-2xl font-black">Bloquear agenda</h3>
            <div className="mt-5 grid gap-3">
              <select className={input} name="empleadoId" required>
                {empleados.map((empleado) => (
                  <option key={empleado.id} value={empleado.id}>{empleado.nombre}</option>
                ))}
              </select>
              <input className={input} name="fechaInicio" required type="datetime-local" />
              <input className={input} name="fechaFin" required type="datetime-local" />
              <input className={input} name="motivo" placeholder="Motivo" />
              <SubmitButton label="Guardar bloqueo" pendingLabel="Guardando…" className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-black text-slate-950" />
            </div>
          </form>
        </div>

        <div className="space-y-4 overflow-hidden">
          <section className="glass-panel rounded-[2rem] p-5" id="slots">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className={`text-xs font-black uppercase tracking-[0.18em] ${citaMover ? "text-amber-600" : "text-cyan-700"}`}>
                  {citaMover ? "Reagendamiento activo" : "Slots disponibles"}
                </p>
                <h3 className="mt-1 text-2xl font-black">
                  {citaMover ? `Mover cita de ${citaMover.cliente}` : "Seleccionar hora y crear cita"}
                </h3>
                {citaMover && (
                  <p className="mt-1 text-sm text-slate-500">
                    {citaMover.servicio} · actual: {fmtDateTime(citaMover.inicio)}
                    <Link className="ml-3 text-xs font-bold text-red-500 hover:underline" href="/admin/agenda">Cancelar</Link>
                  </p>
                )}
              </div>
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">{slots.length} disponibles</span>
            </div>
            <div className="mt-5 flex gap-3 overflow-x-auto pb-2 scrollbar-soft">
              {slots.map((slot) => (
                citaMover ? (
                  <form action={reagendarCita} className="min-w-[240px] rounded-[1.4rem] border border-amber-200 bg-amber-50 p-4 shadow-sm" key={slot.inicio}>
                    <input name="citaId" type="hidden" value={citaMover.id} />
                    <input name="empleadoId" type="hidden" value={empleadoId} />
                    <input name="servicioId" type="hidden" value={servicioId} />
                    <input name="inicio" type="hidden" value={slot.inicio} />
                    <input name="fin" type="hidden" value={slot.fin} />
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-600">Nuevo horario</p>
                    <strong className="mt-2 block text-lg">{fmtDateTime(slot.inicio)}</strong>
                    <p className="mt-1 text-sm text-slate-500">Finaliza {fmtDateTime(slot.fin)}</p>
                    <SubmitButton label="Reagendar aquí" pendingLabel="Reagendando…" className="mt-3 w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-black text-white hover:bg-amber-600" />
                  </form>
                ) : (
                  <form action={createCitaAdmin} className="min-w-[260px] rounded-[1.4rem] border bg-white p-4 shadow-sm" key={slot.inicio}>
                    <input name="clienteId" type="hidden" value={clienteId} />
                    <input name="servicioId" type="hidden" value={servicioId} />
                    <input name="empleadoId" type="hidden" value={empleadoId} />
                    <input name="inicio" type="hidden" value={slot.inicio} />
                    <input name="fin" type="hidden" value={slot.fin} />
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Horario</p>
                    <strong className="mt-2 block text-lg">{fmtDateTime(slot.inicio)}</strong>
                    <p className="mt-1 text-sm text-slate-500">Finaliza {fmtDateTime(slot.fin)}</p>
                    <select className={`${input} mt-4`} name="estado" defaultValue="confirmada">
                      <option value="confirmada">Confirmada</option>
                      <option value="reservada">Reservada</option>
                    </select>
                    <SubmitButton label="Crear cita" pendingLabel="Creando…" className="mt-3 w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-black text-white" />
                  </form>
                )
              ))}
              {slots.length === 0 ? (
                <p className="w-full rounded-2xl border border-dashed bg-white/70 p-8 text-center text-sm font-semibold text-slate-500">
                  Sin horarios disponibles. Revisa que el empleado tenga horario activo y no tenga bloqueos.
                </p>
              ) : null}
            </div>
          </section>

          <section className="flex gap-4 overflow-x-auto pb-2 scrollbar-soft">
            {citas.map((cita) => (
              <article className="glass-panel min-w-[310px] rounded-[1.7rem] p-5 transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl sm:min-w-[360px]" key={cita.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{fmtDateTime(cita.inicio)}</p>
                    <h3 className="mt-2 text-xl font-black">{cita.cliente}</h3>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${badge(cita.estado)}`}>{cita.estado}</span>
                </div>
                <dl className="mt-5 grid gap-3 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Servicio</dt><dd className="font-semibold text-right">{cita.servicio}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Empleado</dt><dd className="font-semibold text-right">{cita.empleado}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Categoria</dt><dd className="font-semibold capitalize">{cita.categoria.replace("_", " ")}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">WhatsApp</dt><dd><a className="rounded-full bg-emerald-50 px-3 py-1 font-black text-emerald-700" href={`https://wa.me/57${cita.telefono.replace(/\D/g, "")}`} target="_blank">Contactar</a></dd></div>
                </dl>
                {cita.estado !== "realizada" && cita.estado !== "cancelada" && cita.estado !== "no_asistio" ? (
                  <div className="mt-5 space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {/* confirmada — no destructivo, sin confirm */}
                      <form action={updateCitaAdmin}>
                        <input name="citaId" type="hidden" value={cita.id} />
                        <input name="estado" type="hidden" value="confirmada" />
                        <button className="w-full rounded-xl border bg-white px-2 py-2 text-[11px] font-black text-slate-700" type="submit">Confirmada</button>
                      </form>
                      {/* cancelada — destructivo */}
                      <ConfirmForm action={updateCitaAdmin} message="¿Cancelar esta cita? Esta acción es difícil de revertir.">
                        <input name="citaId" type="hidden" value={cita.id} />
                        <input name="estado" type="hidden" value="cancelada" />
                        <button className="w-full rounded-xl border bg-white px-2 py-2 text-[11px] font-black text-slate-700" type="submit">Cancelada</button>
                      </ConfirmForm>
                      {/* no_asistio — destructivo */}
                      <ConfirmForm action={updateCitaAdmin} message="¿Marcar al cliente como no asistió?">
                        <input name="citaId" type="hidden" value={cita.id} />
                        <input name="estado" type="hidden" value="no_asistio" />
                        <button className="w-full rounded-xl border bg-white px-2 py-2 text-[11px] font-black text-slate-700" type="submit">No asistio</button>
                      </ConfirmForm>
                    </div>
                    <Link
                      className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black transition ${mover === cita.id ? "bg-amber-500 text-white" : "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
                      href={mover === cita.id ? "/admin/agenda" : `/admin/agenda?mover=${cita.id}&empleadoId=${cita.empleadoId}&servicioId=${cita.servicioId}&fecha=${fecha}`}
                    >
                      {mover === cita.id ? "✕ Cancelar mover" : "Mover cita"}
                    </Link>
                  </div>
                ) : null}
              </article>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="glass-panel rounded-[2rem] p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Horarios activos</p>
              <div className="mt-4 grid gap-2">
                {horarios.slice(0, 8).map((horario) => (
                  <div className="flex items-start justify-between gap-2 rounded-xl border border-slate-700/50 bg-slate-900/80 p-3 text-sm" key={horario.id}>
                    <div>
                      <strong>{horario.empleado}</strong>
                      <p className="text-slate-500">{days[horario.diaSemana]} · {String(horario.horaInicio).slice(0, 5)} - {String(horario.horaFin).slice(0, 5)}</p>
                    </div>
                    <ConfirmForm action={deleteHorario} message="¿Eliminar este horario? El empleado dejará de tener disponibilidad en ese turno.">
                      <input name="horarioId" type="hidden" value={horario.id} />
                      <button className="rounded-lg px-2 py-1 text-[11px] font-bold text-slate-400 hover:bg-red-50 hover:text-red-600" type="submit" title="Eliminar horario">✕</button>
                    </ConfirmForm>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-panel rounded-[2rem] p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Bloqueos recientes</p>
              <div className="mt-4 grid gap-2">
                {bloqueos.slice(0, 8).map((bloqueo) => (
                  <div className="flex items-start justify-between gap-2 rounded-xl border border-slate-700/50 bg-slate-900/80 p-3 text-sm" key={bloqueo.id}>
                    <div>
                      <strong>{bloqueo.empleado}</strong>
                      <p className="text-slate-500">{fmtDateTime(bloqueo.fechaInicio)} - {fmtDateTime(bloqueo.fechaFin)}</p>
                      <p className="text-slate-500">{bloqueo.motivo || "Sin motivo"}</p>
                    </div>
                    <ConfirmForm action={deleteBloqueo} message="¿Eliminar este bloqueo?">
                      <input name="bloqueoId" type="hidden" value={bloqueo.id} />
                      <button className="rounded-lg px-2 py-1 text-[11px] font-bold text-slate-400 hover:bg-red-50 hover:text-red-600" type="submit" title="Eliminar bloqueo">✕</button>
                    </ConfirmForm>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>}

    </div>
  );
}
