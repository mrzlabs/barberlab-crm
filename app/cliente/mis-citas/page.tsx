import Link from "next/link";
import { Search } from "lucide-react";
import { fmtDateTime, fmtMoney, toDateInput } from "@/lib/admin/format";
import { requireRole } from "@/lib/auth/session";
import { getComentariosParaCitas, getHistorialCliente, getMisCitas, getMisPuntos, getReservaCatalog, getSlots } from "@/lib/cliente/queries";
import { buscarSlotsSchema } from "@/lib/validations/cliente";
import { cancelarCita, confirmarCita, reprogramarCita, saveComentarioCita } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };
function getParam(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

function estadoTone(estado: string): "neutral" | "primary" | "success" | "danger" {
  if (estado === "realizada") return "success";
  if (estado === "cancelada" || estado === "no_asistio") return "danger";
  if (estado === "confirmada") return "primary";
  return "neutral";
}
function estadoLabel(estado: string) {
  const m: Record<string, string> = { reservada: "Agendado", confirmada: "Confirmado", realizada: "Cerrado", cancelada: "Cancelado", no_asistio: "No asistió" };
  return m[estado] ?? estado;
}
function estadoDetalle(estado: string) {
  if (estado === "reservada") return "Tu cita fue solicitada. El comercio debe confirmarla.";
  if (estado === "confirmada") return "Tu cita está confirmada. Asiste en el horario indicado.";
  if (estado === "realizada") return "Servicio atendido y cerrado.";
  if (estado === "cancelada") return "La cita fue cancelada.";
  if (estado === "no_asistio") return "La cita quedó marcada como no asistida.";
  return "Estado operativo de la cita.";
}

export default async function MisCitasPage({ searchParams }: PageProps) {
  const profile = await requireRole(["cliente"]);
  const [{ citas }, catalog, historial] = await Promise.all([getMisCitas(profile.id), getReservaCatalog(), getHistorialCliente(profile.id)]);
  await getMisPuntos(profile.id);
  const editComentario = getParam(searchParams?.editComentario);
  const citaComentariosRaw = await getComentariosParaCitas(citas.map(c => c.id));
  const comentariosClienteMap = Object.fromEntries(
    citaComentariosRaw.map(c => [c.citaId, (() => { try { return JSON.parse(c.detalle || "{}").comentario || ""; } catch { return ""; } })()])
  );
  const citaReprogramar = getParam(searchParams?.citaId);
  const filter = getParam(searchParams?.filter);
  const query = (getParam(searchParams?.q) || "").toLowerCase();
  const citasFiltradas = citas
    .filter(c => filter === "aprobar" ? c.estado === "reservada" : true)
    .filter(c => query ? c.servicio.toLowerCase().includes(query) || c.empleado.toLowerCase().includes(query) : true);
  const pendienteCount = citas.filter(c => c.estado === "reservada").length;
  const params = buscarSlotsSchema.parse({
    servicioId: getParam(searchParams?.servicioId) || catalog.servicios[0]?.id,
    empleadoId: getParam(searchParams?.empleadoId) || catalog.empleados[0]?.id,
    fecha: getParam(searchParams?.fecha) || toDateInput(),
  });
  const slots = citaReprogramar ? await getSlots(params.empleadoId, params.fecha, params.servicioId) : [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mis citas"
        description="Consulta, confirma, cancela o reprograma tus citas."
        actions={
          <Link className="inline-flex h-control items-center rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover" href="/cliente/reservar">
            Nueva reserva
          </Link>
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <form className="flex gap-2" method="get">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ds-fg-subtle" />
            <Input className="w-56 pl-9" name="q" type="search" defaultValue={query} placeholder="Buscar servicio o empleado…" />
          </div>
          <button className="h-control rounded-control border border-ds-border-strong bg-ds-surface px-4 text-sm font-medium text-ds-fg transition-colors hover:bg-ds-surface-2" type="submit">Buscar</button>
        </form>
        <Link
          className={`inline-flex h-control items-center gap-1.5 rounded-control px-4 text-sm font-medium transition-colors ${filter === "aprobar" ? "bg-ds-primary text-white" : "border border-ds-border bg-ds-surface text-ds-fg-muted hover:border-ds-border-strong hover:text-ds-fg"}`}
          href={filter === "aprobar" ? "/cliente/mis-citas" : "/cliente/mis-citas?filter=aprobar"}
        >
          Por aprobar {pendienteCount > 0 && <span className="rounded-full bg-black/10 px-1.5 py-0.5 text-[10px]">{pendienteCount}</span>}
        </Link>
      </div>

      {/* Reprogramar */}
      {citaReprogramar && (
        <section className="overflow-hidden rounded-card border border-ds-border bg-ds-surface shadow-ds-sm">
          <div className="border-b border-ds-border p-5">
            <h3 className="text-base font-semibold text-ds-fg">Reprogramar cita</h3>
            <p className="mt-1 text-[13px] text-ds-fg-muted">Selecciona nueva combinación y confirma un slot disponible.</p>
          </div>
          <form className="grid gap-4 p-5 md:grid-cols-4">
            <input name="citaId" type="hidden" value={citaReprogramar} />
            <label className="grid gap-1.5 text-[13px] font-medium text-ds-fg">Servicio
              <Select defaultValue={params.servicioId} name="servicioId" required>
                {catalog.servicios.map((service) => <option key={service.id} value={service.id}>{service.nombre}</option>)}
              </Select>
            </label>
            <label className="grid gap-1.5 text-[13px] font-medium text-ds-fg">Especialista
              <Select defaultValue={params.empleadoId} name="empleadoId" required>
                {catalog.empleados.map((employee) => <option key={employee.id} value={employee.id}>{employee.nombre}</option>)}
              </Select>
            </label>
            <label className="grid gap-1.5 text-[13px] font-medium text-ds-fg">Fecha
              <Input defaultValue={params.fecha} min={toDateInput()} name="fecha" required type="date" />
            </label>
            <div className="flex items-end">
              <button className="h-control w-full rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover" type="submit">Buscar</button>
            </div>
          </form>
          <div className="grid gap-3 p-5 pt-0 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <form action={reprogramarCita} className="rounded-control border border-ds-border bg-ds-surface p-4" key={slot.inicio}>
                <input name="citaId" type="hidden" value={citaReprogramar} />
                <input name="servicioId" type="hidden" value={params.servicioId} />
                <input name="empleadoId" type="hidden" value={params.empleadoId} />
                <input name="inicio" type="hidden" value={slot.inicio} />
                <input name="fin" type="hidden" value={slot.fin} />
                <strong className="block text-[15px] font-semibold text-ds-fg">{fmtDateTime(slot.inicio)}</strong>
                <p className="mt-1 text-[12px] text-ds-fg-muted">Finaliza {fmtDateTime(slot.fin)}</p>
                <button className="mt-3 h-control w-full rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover" type="submit">Confirmar cambio</button>
              </form>
            ))}
            {slots.length === 0 && (
              <p className="rounded-control border border-dashed border-ds-border p-8 text-center text-sm text-ds-fg-subtle sm:col-span-2 lg:col-span-3">
                Sin slots para reprogramar con la selección actual.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Citas */}
      {citas.length === 0 ? (
        <div className="rounded-card border border-dashed border-ds-border bg-ds-surface p-8 text-center text-sm text-ds-fg-subtle">
          No tienes citas registradas.
        </div>
      ) : (
        <section className="flex gap-4 overflow-x-auto pb-2">
          {citasFiltradas.map((cita) => {
            const bloqueada = cita.estado === "realizada" || cita.estado === "cancelada" || cita.estado === "no_asistio";
            return (
              <article className="min-w-[300px] rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm sm:min-w-[350px]" key={cita.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-ds-fg-muted">{fmtDateTime(cita.inicio)}</p>
                    <h3 className="mt-1.5 text-base font-semibold text-ds-fg">{cita.servicio}</h3>
                  </div>
                  <Badge tone={estadoTone(cita.estado)}>{estadoLabel(cita.estado)}</Badge>
                </div>
                <dl className="mt-4 grid gap-2.5 text-[13px]">
                  <div className={`rounded-control px-3 py-2 text-[12px] font-medium ${
                    estadoTone(cita.estado) === "success" ? "bg-ds-success-tint text-ds-success"
                    : estadoTone(cita.estado) === "danger" ? "bg-ds-danger-tint text-ds-danger"
                    : estadoTone(cita.estado) === "primary" ? "bg-ds-primary-tint text-ds-primary"
                    : "bg-ds-surface-2 text-ds-fg-muted"
                  }`}>
                    {estadoDetalle(cita.estado)}
                  </div>
                  <div className="flex justify-between gap-4"><dt className="text-ds-fg-muted">Especialista</dt><dd className="text-right font-medium text-ds-fg">{cita.empleado}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-ds-fg-muted">Duración</dt><dd className="ds-nums font-medium text-ds-fg">{cita.duracionMin} min</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-ds-fg-muted">Precio base</dt><dd className="ds-nums font-medium text-ds-fg">{fmtMoney(cita.precio)}</dd></div>
                </dl>
                {cita.estado === "realizada" && (
                  <div className="mt-4 rounded-control border border-ds-border bg-ds-surface-2 p-3">
                    {comentariosClienteMap[cita.id] && editComentario !== cita.id ? (
                      <div>
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ds-fg-muted">Tu opinión</p>
                        <p className="text-[13px] text-ds-fg">{comentariosClienteMap[cita.id]}</p>
                        <Link href={`/cliente/mis-citas?editComentario=${cita.id}`} className="mt-2 inline-block text-[12px] text-ds-primary hover:text-ds-primary-hover">Editar</Link>
                      </div>
                    ) : (
                      <form action={saveComentarioCita} className="grid gap-2">
                        <input name="citaId" type="hidden" value={cita.id} />
                        <label className="text-[11px] font-medium uppercase tracking-wide text-ds-fg-muted">{comentariosClienteMap[cita.id] ? "Editar opinión" : "Dejar opinión"}</label>
                        <Textarea name="comentario" rows={2} maxLength={300} defaultValue={comentariosClienteMap[cita.id] || ""} placeholder="¿Cómo fue el servicio? (máx. 300 caracteres)" className="resize-none" />
                        <div className="flex gap-2">
                          <button type="submit" className="h-control flex-1 rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover">Guardar</button>
                          {comentariosClienteMap[cita.id] && (
                            <Link href="/cliente/mis-citas" className="inline-flex h-control items-center rounded-control border border-ds-border px-4 text-sm font-medium text-ds-fg-muted transition-colors hover:text-ds-fg">Cancelar</Link>
                          )}
                        </div>
                      </form>
                    )}
                  </div>
                )}
                {!bloqueada && (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {cita.estado === "reservada" && (
                      <form action={confirmarCita} className="sm:col-span-2">
                        <input name="citaId" type="hidden" value={cita.id} />
                        <button className="h-control w-full rounded-control border border-ds-success/30 bg-ds-success-tint px-4 text-sm font-medium text-ds-success transition-colors hover:brightness-95" type="submit">Confirmar cita</button>
                      </form>
                    )}
                    <Link
                      className="inline-flex h-control items-center justify-center rounded-control border border-ds-border-strong bg-ds-surface px-4 text-sm font-medium text-ds-fg transition-colors hover:bg-ds-surface-2"
                      href={`/cliente/mis-citas?citaId=${cita.id}&servicioId=${cita.servicioId}&empleadoId=${cita.empleadoId}&fecha=${toDateInput(new Date(cita.inicio))}`}
                    >
                      Reprogramar
                    </Link>
                    <form action={cancelarCita}>
                      <input name="citaId" type="hidden" value={cita.id} />
                      <button className="h-control w-full rounded-control border border-ds-danger/30 bg-ds-danger-tint px-4 text-sm font-medium text-ds-danger transition-colors hover:brightness-95" type="submit">Cancelar</button>
                    </form>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {/* Historial */}
      <section className="rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm">
        <p className="text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Historial</p>
        <h3 className="text-base font-semibold text-ds-fg">Movimientos de tus citas</h3>
        <div className="mt-4 grid gap-2.5">
          {historial.map((item) => (
            <article className="rounded-control border border-ds-border bg-ds-surface-2 p-4 text-[13px]" key={item.id}>
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div>
                  <strong className="block text-ds-fg">{item.servicio}</strong>
                  <span className="text-ds-fg-muted">
                    {item.accion === "comentario_cliente"
                      ? (() => { try { return JSON.parse(item.detalle || "{}").comentario || "Opinión registrada"; } catch { return "Opinión registrada"; } })()
                      : (item.detalle || item.accion)}
                  </span>
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wide text-ds-fg-subtle">{fmtDateTime(item.createdAt)}</span>
              </div>
              <p className="mt-2 text-[12px] font-medium text-ds-fg-subtle">
                {estadoLabel(item.estadoAnterior || "inicio")} → {estadoLabel(item.estadoNuevo || "sin cambio")}
              </p>
            </article>
          ))}
          {historial.length === 0 && (
            <p className="rounded-control border border-dashed border-ds-border p-6 text-center text-sm text-ds-fg-subtle">
              Aún no hay movimientos registrados.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
