import Link from "next/link";
import { Wallet } from "lucide-react";
import { fmtDateTime, fmtMoney, toDateInput } from "@/lib/admin/format";
import { Input } from "@/components/ui/Input";
import { requireRole } from "@/lib/auth/session";
import { getMiAgenda, getStatsEmpleado } from "@/lib/empleado/queries";
import { getComentariosParaCitas } from "@/lib/cliente/queries";
import { updateMiCita } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stat, DeltaBadge } from "@/components/ui/Stat";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

function estadoTone(estado: string): "neutral" | "primary" | "success" | "danger" {
  if (estado === "realizada") return "success";
  if (estado === "cancelada" || estado === "no_asistio") return "danger";
  return "primary";
}

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };
function getParam(v: string | string[] | undefined) { return Array.isArray(v) ? v[0] : v; }

export default async function MiAgendaPage({ searchParams }: PageProps) {
  const profile = await requireRole(["empleado"]);
  const hoy = toDateInput();
  const fdesde = getParam(searchParams?.fdesde) || hoy;
  const fhasta = getParam(searchParams?.fhasta) || "";
  const [agendaRaw, statsRaw] = await Promise.all([getMiAgenda(profile.id, fdesde, fhasta || undefined), getStatsEmpleado(profile.id)]);
  const agenda = JSON.parse(JSON.stringify(agendaRaw)) as typeof agendaRaw;
  const stats  = JSON.parse(JSON.stringify(statsRaw))  as typeof statsRaw;
  const comentariosRaw = await getComentariosParaCitas(agendaRaw.citas.map(c => c.id));
  const comentarioMap = Object.fromEntries(comentariosRaw.map(c => [c.citaId, c.detalle]));

  if (!agenda.empleado) {
    return (
      <div className="rounded-card border border-ds-border bg-ds-surface p-6 shadow-ds-sm">
        <h2 className="text-lg font-semibold text-ds-fg">Empleado sin perfil operativo</h2>
        <p className="mt-2 text-sm text-ds-fg-muted">El usuario existe, pero no tiene registro en la tabla empleados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mi agenda"
        description={`${profile.nombre} · citas asignadas, pendientes y cerradas.`}
        actions={
          <Link href="/empleado/cerrar-turno" className="inline-flex h-control items-center gap-2 rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover">
            <Wallet className="size-4" /> Cerrar turno
          </Link>
        }
      />

      {/* Producción del mes */}
      {stats && (
        <div className="rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ds-fg">
              Mi producción este mes <DeltaBadge delta={stats.delta} />
            </h3>
            <Badge tone="neutral">{stats.comisionPct}% comisión · {stats.especialidad.replace("_", " ")}</Badge>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Turnos cerrados" value={stats.mes.turnos} detail="este mes" />
            <Stat label="Producción bruta" value={fmtMoney(stats.mes.ingresos)} detail={`+${fmtMoney(stats.mes.propinas)} propinas`} />
            <Stat label="Mi comisión" value={fmtMoney(stats.mes.comision)} detail={`${stats.comisionPct}% del bruto`} />
            <Stat label="Ticket promedio" value={fmtMoney(stats.mes.ticket)} detail="por servicio" />
          </div>
        </div>
      )}

      {/* Filtro por rango de fechas */}
      <form className="flex flex-wrap items-end gap-3 rounded-card border border-ds-border bg-ds-surface p-4 shadow-ds-sm" method="get">
        <label className="grid gap-1 text-[12px] font-medium text-ds-fg-muted">Desde
          <Input className="w-[165px]" defaultValue={fdesde} name="fdesde" type="date" />
        </label>
        <label className="grid gap-1 text-[12px] font-medium text-ds-fg-muted">Hasta
          <Input className="w-[165px]" defaultValue={fhasta} name="fhasta" type="date" />
        </label>
        <button className="h-control rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover" type="submit">Aplicar</button>
        <span className="ds-nums text-[13px] text-ds-fg-muted sm:ml-auto">
          {agenda.citas.length} cita{agenda.citas.length !== 1 ? "s" : ""} {fhasta ? "en el rango" : "de hoy en adelante"}
        </span>
      </form>

      {/* Stats del día */}
      <section className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat label="Citas hoy" value={agenda.stats.hoy} />
        <Stat label="Pendientes" value={agenda.stats.pendientes} />
        <Stat label="Realizadas" value={agenda.stats.realizadas} />
      </section>

      {/* Citas */}
      {agenda.citas.length === 0 ? (
        <div className="rounded-card border border-dashed border-ds-border bg-ds-surface p-8 text-center text-sm text-ds-fg-subtle">
          No hay citas asignadas.
        </div>
      ) : (
        <section className="flex gap-4 overflow-x-auto pb-2">
          {agenda.citas.map((cita) => (
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
                <div className="flex justify-between gap-4"><dt className="text-ds-fg-muted">Duración</dt><dd className="ds-nums font-medium text-ds-fg">{cita.duracionMin} min</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-ds-fg-muted">Precio base</dt><dd className="ds-nums font-medium text-ds-fg">{fmtMoney(cita.precio)}</dd></div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ds-fg-muted">WhatsApp</dt>
                  <dd><a className="rounded-full bg-ds-success-tint px-2.5 py-0.5 text-[12px] font-medium text-ds-success" href={`https://wa.me/57${cita.telefono.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">Contactar</a></dd>
                </div>
              </dl>
              {comentarioMap[cita.id] && (
                <div className="mt-3 rounded-control border border-ds-border bg-ds-surface-2 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-ds-fg-muted">Opinión del cliente</p>
                  <p className="mt-1 text-[13px] text-ds-fg">
                    {(() => { try { return JSON.parse(comentarioMap[cita.id] || "{}").comentario; } catch { return ""; } })()}
                  </p>
                </div>
              )}
              {cita.estado !== "realizada" && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {["confirmada", "cancelada", "no_asistio"].map((estado) => (
                    <form action={updateMiCita} key={estado}>
                      <input name="citaId" type="hidden" value={cita.id} />
                      <input name="estado" type="hidden" value={estado} />
                      <button className="w-full rounded-control border border-ds-border px-2 py-1.5 text-[11px] font-medium capitalize text-ds-fg-muted transition-colors hover:border-ds-border-strong hover:text-ds-fg" type="submit">
                        {estado.replace("_", " ")}
                      </button>
                    </form>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
