import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { fmtDate, fmtDateTime, toDateInput } from "@/lib/admin/format";
import { getAgendaRango, getBloqueosAdmin, getClientesAdmin, getEmpleadosAdmin, getHorariosAdmin, getServiciosAdmin } from "@/lib/admin/catalog";
import { getSlots } from "@/lib/cliente/queries";
import { AgendaCalendar } from "@/components/admin/AgendaCalendar";
import { AgendaBoardView } from "@/components/admin/AgendaBoardView";
import { ConfirmForm } from "@/components/layout/ConfirmForm";
import { SubmitButton } from "@/components/layout/SubmitButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Alert";
import { createBloqueoEmpleado, createCitaAdmin, createHorarioEmpleado, deleteBloqueo, deleteHorario, reagendarCita, updateCitaAdmin } from "./actions";

export const dynamic = "force-dynamic";

const days = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
const lbl = "grid gap-1 text-[12px] font-medium text-ds-fg-muted";
const cardCls = "rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm";
const summaryCls = "flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };
function getParam(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

function estadoTone(estado: string): "neutral" | "primary" | "success" | "danger" {
  if (estado === "realizada") return "success";
  if (estado === "cancelada" || estado === "no_asistio") return "danger";
  if (estado === "confirmada") return "primary";
  return "neutral";
}

function isUuid(value?: string) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}
function addDays(fecha: string, dias: number) { const d = new Date(`${fecha}T12:00:00`); d.setDate(d.getDate() + dias); return toDateInput(d); }
/** Días (YYYY-MM-DD) cubiertos por el rango, con tope para no reventar el calendario. */
function diasDelRango(desde: string, hasta: string, max = 14) {
  const dias: string[] = [];
  let cursor = desde;
  while (cursor <= hasta && dias.length < max) { dias.push(cursor); cursor = addDays(cursor, 1); }
  return dias.length ? dias : [desde];
}

export default async function AdminAgendaPage({ searchParams }: PageProps) {
  const vista = getParam(searchParams?.vista) ?? "board";
  const hoy = toDateInput();
  // Rango de FECHAS de la agenda (distinto de desde/hasta, que filtran HORAS de los slots).
  const fdesde = getParam(searchParams?.fdesde) || hoy;
  const fhasta = getParam(searchParams?.fhasta) || "";
  const fecha = getParam(searchParams?.fecha) || fdesde;

  const [citas, servicios, empleados, clientes, horarios, bloqueos] = await Promise.all([
    getAgendaRango(fdesde, fhasta || undefined), getServiciosAdmin(), getEmpleadosAdmin(), getClientesAdmin(), getHorariosAdmin(), getBloqueosAdmin(),
  ]);

  // Calendario: una rejilla por cada día del rango (si no hay tope, muestra una semana).
  const diasCalendario = vista === "calendario" ? diasDelRango(fdesde, fhasta || addDays(fdesde, 6)) : [];
  const mover = getParam(searchParams?.mover);
  const citaMover = mover ? citas.find((c) => c.id === mover) : null;
  const servicioId = citaMover?.servicioId ?? getParam(searchParams?.servicioId) ?? servicios[0]?.id;
  const empleadoId = citaMover?.empleadoId ?? getParam(searchParams?.empleadoId) ?? empleados[0]?.id;
  const clienteId = getParam(searchParams?.clienteId) || clientes[0]?.id;
  const desde = getParam(searchParams?.desde) || "";
  const hasta = getParam(searchParams?.hasta) || "";
  const slots = isUuid(servicioId) && isUuid(empleadoId)
    ? await getSlots(empleadoId, fecha, servicioId, { desde: desde || undefined, hasta: hasta || undefined })
    : [];

  const tabCls = (active: boolean) =>
    `inline-flex h-control items-center rounded-control px-3.5 text-[13px] font-medium transition-colors ${
      active ? "bg-ds-primary text-white" : "border border-ds-border bg-ds-surface text-ds-fg-muted hover:border-ds-border-strong hover:text-ds-fg"
    }`;

  const err = getParam(searchParams?.err);

  return (
    <div className="space-y-5">
      {err && <Alert tone="danger">{err}</Alert>}
      <PageHeader
        title="Agenda"
        description="Crea citas, configura disponibilidad y controla toda la operación por especialista."
        actions={
          <a href="#nueva-cita" className="inline-flex h-control items-center gap-2 rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover">
            + Nueva cita
          </a>
        }
      />

      {/* Toggle vista */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Link className={tabCls(vista === "board")} href={`/admin/agenda?vista=board&fdesde=${fdesde}&fhasta=${fhasta}`}>Board</Link>
          <Link className={tabCls(vista === "lista")} href={`/admin/agenda?vista=lista&fdesde=${fdesde}&fhasta=${fhasta}`}>Lista</Link>
          <Link className={tabCls(vista === "calendario")} href={`/admin/agenda?vista=calendario&fdesde=${fdesde}&fhasta=${fhasta}`}>Calendario</Link>
        </div>
        <span className="ds-nums text-[13px] text-ds-fg-muted">
          {citas.length} reserva{citas.length !== 1 ? "s" : ""} {fhasta ? `· ${fmtDate(`${fdesde}T12:00:00`)} a ${fmtDate(`${fhasta}T12:00:00`)}` : `· desde ${fmtDate(`${fdesde}T12:00:00`)} en adelante`}
        </span>
      </div>

      {/* Filtro por rango de fechas */}
      <form className={`${cardCls} flex flex-wrap items-end gap-3`} method="get">
        <input type="hidden" name="vista" value={vista} />
        <label className={lbl}>Desde<Input className="w-[165px]" defaultValue={fdesde} name="fdesde" type="date" /></label>
        <label className={lbl}>Hasta<Input className="w-[165px]" defaultValue={fhasta} name="fhasta" type="date" /></label>
        <button className="h-control rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover" type="submit">Aplicar</button>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          {[
            { label: "Hoy", d: hoy, h: hoy },
            { label: "7 días", d: hoy, h: addDays(hoy, 7) },
            { label: "30 días", d: hoy, h: addDays(hoy, 30) },
            { label: "Todo lo futuro", d: hoy, h: "" },
          ].map((a) => {
            const activo = fdesde === a.d && fhasta === a.h;
            return (
              <Link
                key={a.label}
                href={`/admin/agenda?vista=${vista}&fdesde=${a.d}&fhasta=${a.h}`}
                className={`inline-flex h-control items-center rounded-control px-3 text-[13px] font-medium transition-colors ${
                  activo ? "bg-ds-primary text-white" : "border border-ds-border bg-ds-surface text-ds-fg-muted hover:border-ds-border-strong hover:text-ds-fg"
                }`}
              >
                {a.label}
              </Link>
            );
          })}
        </div>
      </form>

      {vista === "board" && (
        <AgendaBoardView citas={citas} empleados={empleados.map((e) => ({ id: e.id, nombre: e.nombre, activo: e.activo }))} fecha={fecha} />
      )}

      {vista === "calendario" && (
        <div className="space-y-4">
          {diasCalendario.map((dia) => {
            const delDia = citas.filter((c) => toDateInput(new Date(c.inicio)) === dia);
            return (
              <div key={dia}>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-[13px] font-semibold capitalize text-ds-fg">{fmtDate(`${dia}T12:00:00`)}</h3>
                  <span className="ds-nums rounded-full bg-ds-surface-2 px-2 py-0.5 text-[11px] font-medium text-ds-fg-muted">{delDia.length}</span>
                </div>
                <AgendaCalendar citas={delDia} empleados={empleados.map((e) => ({ id: e.id, nombre: e.nombre }))} />
              </div>
            );
          })}
        </div>
      )}

      {vista === "lista" && (
        <section className="grid gap-5 xl:grid-cols-[410px_1fr]">
          <div className="space-y-4">
            <details className={`group ${cardCls}`} id="nueva-cita" open>
              <summary className={summaryCls}>
                <span>
                  <span className="block text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Crear cita admin</span>
                  <span className="text-base font-semibold text-ds-fg">Nueva cita</span>
                </span>
                <ChevronDown className="size-4 shrink-0 text-ds-fg-muted transition-transform group-open:rotate-180" />
              </summary>
              <form>
              {/* Conserva la vista Lista al consultar horarios (si no, el GET
                  borra vista=lista y la página cae a Board, ocultando los slots
                  y el botón de crear cita). */}
              <input type="hidden" name="vista" value="lista" />
              <input type="hidden" name="fdesde" value={fdesde} />
              <input type="hidden" name="fhasta" value={fhasta} />
              <div className="mt-4 grid gap-3">
                <label className={lbl}>Cliente
                  <Select defaultValue={clienteId} name="clienteId" required>
                    {clientes.map((cliente) => <option key={cliente.id} value={cliente.id}>{cliente.nombre} · {cliente.telefono}</option>)}
                  </Select>
                </label>
                <label className={lbl}>Servicio
                  <Select defaultValue={servicioId} name="servicioId" required>
                    {servicios.map((servicio) => <option key={servicio.id} value={servicio.id}>{servicio.nombre}</option>)}
                  </Select>
                </label>
                <label className={lbl}>Especialista
                  <Select defaultValue={empleadoId} name="empleadoId" required>
                    {empleados.map((empleado) => <option key={empleado.id} value={empleado.id}>{empleado.nombre} · {empleado.especialidad.replace("_", " ")}</option>)}
                  </Select>
                </label>
                <label className={lbl}>Fecha<Input defaultValue={fecha} min={toDateInput()} name="fecha" required type="date" /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={lbl}>Desde<Input defaultValue={desde} name="desde" type="time" /></label>
                  <label className={lbl}>Hasta<Input defaultValue={hasta} name="hasta" type="time" /></label>
                </div>
                <SubmitButton label="Consultar horarios" pendingLabel="Buscando…" className="h-control rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover" />
              </div>
              </form>
            </details>

            <details className={`group ${cardCls}`}>
              <summary className={summaryCls}>
                <span>
                  <span className="block text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Disponibilidad</span>
                  <span className="text-base font-semibold text-ds-fg">Agregar horario</span>
                </span>
                <ChevronDown className="size-4 shrink-0 text-ds-fg-muted transition-transform group-open:rotate-180" />
              </summary>
              <form action={createHorarioEmpleado}>
              <div className="mt-4 grid gap-3">
                <Select name="empleadoId" required>{empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}</Select>
                <Select name="diaSemana" required>{days.map((day, index) => <option key={day} value={index}>{day}</option>)}</Select>
                <div className="grid grid-cols-2 gap-3">
                  <Input name="horaInicio" required type="time" />
                  <Input name="horaFin" required type="time" />
                </div>
                <SubmitButton label="Guardar horario" pendingLabel="Guardando…" className="h-control rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover" />
              </div>
              </form>
            </details>

            <details className={`group ${cardCls}`}>
              <summary className={summaryCls}>
                <span>
                  <span className="block text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Bloqueos</span>
                  <span className="text-base font-semibold text-ds-fg">Bloquear agenda</span>
                </span>
                <ChevronDown className="size-4 shrink-0 text-ds-fg-muted transition-transform group-open:rotate-180" />
              </summary>
              <form action={createBloqueoEmpleado}>
              <div className="mt-4 grid gap-3">
                <Select name="empleadoId" required>{empleados.map((e) => <option key={e.id} value={e.id}>{e.nombre}</option>)}</Select>
                <Input name="fechaInicio" required type="datetime-local" />
                <Input name="fechaFin" required type="datetime-local" />
                <Input name="motivo" placeholder="Motivo" />
                <SubmitButton label="Guardar bloqueo" pendingLabel="Guardando…" className="h-control rounded-control border border-ds-border-strong bg-ds-surface px-4 text-sm font-medium text-ds-fg transition-colors hover:bg-ds-surface-2" />
              </div>
              </form>
            </details>
          </div>

          <div className="space-y-4 overflow-hidden">
            <section className={cardCls} id="slots">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">{citaMover ? "Reagendamiento activo" : "Slots disponibles"}</p>
                  <h3 className="text-base font-semibold text-ds-fg">{citaMover ? `Mover cita de ${citaMover.cliente}` : "Seleccionar hora y crear cita"}</h3>
                  {citaMover && (
                    <p className="mt-1 text-[13px] text-ds-fg-muted">
                      {citaMover.servicio} · actual: {fmtDateTime(citaMover.inicio)}
                      <Link className="ml-3 text-[12px] font-medium text-ds-danger hover:underline" href="/admin/agenda">Cancelar</Link>
                    </p>
                  )}
                </div>
                <Badge tone="neutral">{slots.length} disponibles</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {slots.map((slot) => (
                  citaMover ? (
                    <form action={reagendarCita} className="min-w-[240px] rounded-control border border-ds-warning/30 bg-ds-warning-tint p-4" key={slot.inicio}>
                      <input name="citaId" type="hidden" value={citaMover.id} />
                      <input name="empleadoId" type="hidden" value={empleadoId} />
                      <input name="servicioId" type="hidden" value={servicioId} />
                      <input name="inicio" type="hidden" value={slot.inicio} />
                      <input name="fin" type="hidden" value={slot.fin} />
                      <p className="text-[11px] font-medium uppercase tracking-wide text-ds-warning">Nuevo horario</p>
                      <strong className="mt-1.5 block text-[15px] font-semibold text-ds-fg">{fmtDateTime(slot.inicio)}</strong>
                      <p className="mt-1 text-[12px] text-ds-fg-muted">Finaliza {fmtDateTime(slot.fin)}</p>
                      <SubmitButton label="Reagendar aquí" pendingLabel="Reagendando…" className="mt-3 h-control w-full rounded-control bg-ds-warning px-4 text-sm font-medium text-white hover:brightness-95" />
                    </form>
                  ) : (
                    <form action={createCitaAdmin} className="min-w-[240px] rounded-control border border-ds-border bg-ds-surface p-4" key={slot.inicio}>
                      <input name="clienteId" type="hidden" value={clienteId} />
                      <input name="servicioId" type="hidden" value={servicioId} />
                      <input name="empleadoId" type="hidden" value={empleadoId} />
                      <input name="inicio" type="hidden" value={slot.inicio} />
                      <input name="fin" type="hidden" value={slot.fin} />
                      <p className="text-[11px] font-medium uppercase tracking-wide text-ds-fg-muted">Horario</p>
                      <strong className="mt-1.5 block text-[15px] font-semibold text-ds-fg">{fmtDateTime(slot.inicio)}</strong>
                      <p className="mt-1 text-[12px] text-ds-fg-muted">Finaliza {fmtDateTime(slot.fin)}</p>
                      {servicios.find((s) => s.id === servicioId)?.categoria === "tatuajes" && (
                        <label className="mt-3 block text-[11px] font-medium uppercase text-ds-warning">
                          Duración sesión (min)
                          <Input className="mt-1" name="duracionOverride" type="number" min="30" step="30" placeholder={`${servicios.find((s) => s.id === servicioId)?.duracionMin ?? 120} (por defecto)`} />
                        </label>
                      )}
                      <Select className="mt-3" name="estado" defaultValue="confirmada">
                        <option value="confirmada">Confirmada</option>
                        <option value="reservada">Reservada</option>
                      </Select>
                      <SubmitButton label="Crear cita" pendingLabel="Creando…" className="mt-3 h-control w-full rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover" />
                    </form>
                  )
                ))}
                {slots.length === 0 && (
                  <p className="w-full rounded-control border border-dashed border-ds-border p-8 text-center text-sm text-ds-fg-subtle">
                    Sin horarios disponibles. Revisa que el empleado tenga horario activo y no tenga bloqueos.
                  </p>
                )}
              </div>
            </section>

            <section className="flex gap-4 overflow-x-auto pb-2">
              {citas.map((cita) => (
                <article className="min-w-[300px] rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm sm:min-w-[340px]" key={cita.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-ds-fg-muted">{fmtDateTime(cita.inicio)}</p>
                      <h3 className="mt-1.5 text-base font-semibold text-ds-fg">{cita.cliente}</h3>
                    </div>
                    <Badge tone={estadoTone(cita.estado)}>{cita.estado}</Badge>
                  </div>
                  <dl className="mt-4 grid gap-2.5 text-[13px]">
                    <div className="flex justify-between gap-4"><dt className="text-ds-fg-muted">Servicio</dt><dd className="text-right font-medium text-ds-fg">{cita.servicio}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-ds-fg-muted">Empleado</dt><dd className="text-right font-medium text-ds-fg">{cita.empleado}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-ds-fg-muted">Categoría</dt><dd className="font-medium capitalize text-ds-fg">{cita.categoria.replace("_", " ")}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-ds-fg-muted">WhatsApp</dt><dd><a className="rounded-full bg-ds-success-tint px-2.5 py-0.5 text-[12px] font-medium text-ds-success" href={`https://wa.me/57${cita.telefono.replace(/\D/g, "")}`} target="_blank">Contactar</a></dd></div>
                  </dl>
                  {cita.estado !== "realizada" && cita.estado !== "cancelada" && cita.estado !== "no_asistio" && (
                    <div className="mt-4 space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <form action={updateCitaAdmin}>
                          <input name="citaId" type="hidden" value={cita.id} />
                          <input name="estado" type="hidden" value="confirmada" />
                          <button className="w-full rounded-control border border-ds-border px-2 py-1.5 text-[11px] font-medium text-ds-fg-muted transition-colors hover:border-ds-border-strong hover:text-ds-fg" type="submit">Confirmada</button>
                        </form>
                        <ConfirmForm action={updateCitaAdmin} message="¿Cancelar esta cita? Esta acción es difícil de revertir.">
                          <input name="citaId" type="hidden" value={cita.id} />
                          <input name="estado" type="hidden" value="cancelada" />
                          <button className="w-full rounded-control border border-ds-border px-2 py-1.5 text-[11px] font-medium text-ds-fg-muted transition-colors hover:border-ds-danger/40 hover:text-ds-danger" type="submit">Cancelada</button>
                        </ConfirmForm>
                        <ConfirmForm action={updateCitaAdmin} message="¿Marcar al cliente como no asistió?">
                          <input name="citaId" type="hidden" value={cita.id} />
                          <input name="estado" type="hidden" value="no_asistio" />
                          <button className="w-full rounded-control border border-ds-border px-2 py-1.5 text-[11px] font-medium text-ds-fg-muted transition-colors hover:border-ds-warning/40 hover:text-ds-warning" type="submit">No asistió</button>
                        </ConfirmForm>
                      </div>
                      <Link
                        className={`flex items-center justify-center rounded-control px-3 py-2 text-[12px] font-medium transition-colors ${mover === cita.id ? "bg-ds-warning text-white" : "border border-ds-warning/30 bg-ds-warning-tint text-ds-warning hover:brightness-95"}`}
                        href={mover === cita.id ? "/admin/agenda" : `/admin/agenda?mover=${cita.id}&empleadoId=${cita.empleadoId}&servicioId=${cita.servicioId}&fecha=${fecha}`}
                      >
                        {mover === cita.id ? "✕ Cancelar mover" : "Mover cita"}
                      </Link>
                    </div>
                  )}
                </article>
              ))}
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className={cardCls}>
                <p className="text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Horarios activos</p>
                <div className="mt-3 grid gap-2">
                  {horarios.slice(0, 8).map((horario) => (
                    <div className="flex items-start justify-between gap-2 rounded-control border border-ds-border bg-ds-surface-2 p-3 text-[13px]" key={horario.id}>
                      <div>
                        <strong className="text-ds-fg">{horario.empleado}</strong>
                        <p className="ds-nums text-ds-fg-muted">{days[horario.diaSemana]} · {String(horario.horaInicio).slice(0, 5)} - {String(horario.horaFin).slice(0, 5)}</p>
                      </div>
                      <ConfirmForm action={deleteHorario} message="¿Eliminar este horario? El empleado dejará de tener disponibilidad en ese turno.">
                        <input name="horarioId" type="hidden" value={horario.id} />
                        <button className="rounded px-2 py-1 text-[12px] font-medium text-ds-fg-subtle hover:text-ds-danger" type="submit" title="Eliminar horario">✕</button>
                      </ConfirmForm>
                    </div>
                  ))}
                </div>
              </div>
              <div className={cardCls}>
                <p className="text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Bloqueos recientes</p>
                <div className="mt-3 grid gap-2">
                  {bloqueos.slice(0, 8).map((bloqueo) => (
                    <div className="flex items-start justify-between gap-2 rounded-control border border-ds-border bg-ds-surface-2 p-3 text-[13px]" key={bloqueo.id}>
                      <div>
                        <strong className="text-ds-fg">{bloqueo.empleado}</strong>
                        <p className="text-ds-fg-muted">{fmtDateTime(bloqueo.fechaInicio)} - {fmtDateTime(bloqueo.fechaFin)}</p>
                        <p className="text-ds-fg-muted">{bloqueo.motivo || "Sin motivo"}</p>
                      </div>
                      <ConfirmForm action={deleteBloqueo} message="¿Eliminar este bloqueo?">
                        <input name="bloqueoId" type="hidden" value={bloqueo.id} />
                        <button className="rounded px-2 py-1 text-[12px] font-medium text-ds-fg-subtle hover:text-ds-danger" type="submit" title="Eliminar bloqueo">✕</button>
                      </ConfirmForm>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </section>
      )}
    </div>
  );
}
