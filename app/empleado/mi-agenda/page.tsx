import Link from "next/link";
import { fmtDateTime, fmtMoney } from "@/lib/admin/format";
import { requireRole } from "@/lib/auth/session";
import { getMiAgenda, getStatsEmpleado } from "@/lib/empleado/queries";
import { getComentariosParaCitas } from "@/lib/cliente/queries";
import { updateMiCita } from "./actions";

export const dynamic = "force-dynamic";

function estadoClass(estado: string) {
  if (estado === "realizada") return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
  if (estado === "cancelada" || estado === "no_asistio") return "bg-red-500/20 text-red-300 border border-red-500/30";
  return "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30";
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta == null) return null;
  const up = delta >= 0;
  return (
    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-black ${up ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
      {up ? "▲" : "▼"} {Math.abs(delta)}%
    </span>
  );
}

export default async function MiAgendaPage() {
  const profile = await requireRole(["empleado"]);
  const [agendaRaw, statsRaw] = await Promise.all([
    getMiAgenda(profile.id),
    getStatsEmpleado(profile.id),
  ]);
  // Nuclear: garantiza que no llegue ningún Date al árbol RSC
  const agenda = JSON.parse(JSON.stringify(agendaRaw)) as typeof agendaRaw;
  const stats  = JSON.parse(JSON.stringify(statsRaw))  as typeof statsRaw;
  const comentariosRaw = await getComentariosParaCitas(agendaRaw.citas.map(c => c.id));
  const comentarioMap = Object.fromEntries(comentariosRaw.map(c => [c.citaId, c.detalle]));

  if (!agenda.empleado) {
    return (
      <section className="rounded-xl border border-slate-700/50 bg-slate-900/80 p-6 shadow-sm">
        <h2 className="text-2xl font-black">Empleado sin perfil operativo</h2>
        <p className="mt-2 text-sm text-muted-foreground">El usuario existe, pero no tiene registro en la tabla empleados.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 py-8 px-6 text-white shadow-2xl shadow-violet-950/20 sm:py-12 sm:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(34,211,238,.34),transparent_18rem),radial-gradient(circle_at_82%_48%,rgba(168,85,247,.35),transparent_22rem)]" />
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mac-dots" />
            <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Agenda personal</p>
            <h2 className="mt-2 text-[2.5rem] font-black tracking-tight sm:text-[3.5rem]">{profile.nombre}</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              Vista de citas asignadas, pendientes por aceptar, servicios cerrados y acciones rapidas con cliente.
            </p>
          </div>
          <Link className="rounded-2xl bg-cyan-300 px-7 py-3.5 text-base font-black text-slate-950" href="/empleado/cerrar-turno">
            Cerrar turno
          </Link>
        </div>
      </section>

      {/* ── Stats del mes ── */}
      {stats && (
        <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-400">Mi producción</p>
              <h3 className="mt-1 text-xl font-black crm-text-primary">
                Este mes
                <DeltaBadge delta={stats.delta} />
              </h3>
            </div>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black capitalize text-white/70">
              {stats.comisionPct}% comisión · {stats.especialidad.replace("_", " ")}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Turnos cerrados", value: String(stats.mes.turnos), sub: "este mes" },
              { label: "Producción bruta", value: fmtMoney(stats.mes.ingresos), sub: `+${fmtMoney(stats.mes.propinas)} propinas` },
              { label: "Mi comisión", value: fmtMoney(stats.mes.comision), sub: `${stats.comisionPct}% del bruto` },
              { label: "Ticket promedio", value: fmtMoney(stats.mes.ticket), sub: "por servicio" },
            ].map((kpi) => (
              <article key={kpi.label} className="rounded-xl border border-slate-700/50 bg-slate-900/80 p-4 shadow-sm" style={{ borderLeftWidth: "3px", borderLeftColor: "var(--brand-secondary,#22d3ee)" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] crm-text-muted">{kpi.label}</p>
                <strong className="mt-2 block text-xl font-black tracking-tight crm-text-primary">{kpi.value}</strong>
                <p className="mt-1 text-xs crm-text-muted">{kpi.sub}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ── Stats del día ── */}
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Citas hoy", value: agenda.stats.hoy },
          { label: "Pendientes", value: agenda.stats.pendientes },
          { label: "Realizadas", value: agenda.stats.realizadas },
        ].map((s) => (
          <article key={s.label} className="glass-panel rounded-[1.6rem] p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] crm-text-muted">{s.label}</p>
            <strong className="mt-2 block text-3xl font-black crm-text-primary">{s.value}</strong>
          </article>
        ))}
      </section>

      {/* ── Citas ── */}
      <section className="flex gap-4 overflow-x-auto pb-2 scrollbar-soft">
        {agenda.citas.map((cita) => (
          <article className="glass-panel min-w-[300px] rounded-[1.7rem] p-5 transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl sm:min-w-[340px]" key={cita.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] crm-text-muted">{fmtDateTime(cita.inicio)}</p>
                <h3 className="mt-2 text-xl font-black">{cita.cliente}</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${estadoClass(cita.estado)}`}>{cita.estado}</span>
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-xs crm-text-muted">Servicio</dt><dd className="font-semibold crm-text-primary text-right">{cita.servicio}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-xs crm-text-muted">Duración</dt><dd className="font-semibold crm-text-primary">{cita.duracionMin} min</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-xs crm-text-muted">Precio base</dt><dd className="font-semibold crm-text-primary">{fmtMoney(cita.precio)}</dd></div>
              <div className="flex justify-between gap-4">
                <dt className="text-xs crm-text-muted">WhatsApp</dt>
                <dd>
                  <a className="rounded-full bg-emerald-50 px-3 py-1 font-black text-emerald-700" href={`https://wa.me/57${cita.telefono.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    Contactar
                  </a>
                </dd>
              </div>
            </dl>
            {comentarioMap[cita.id] && (
              <div className="mt-3 rounded-xl border border-white/10 bg-white/8 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest crm-text-muted">Opinión del cliente</p>
                <p className="mt-1 text-xs crm-text-primary">
                  {(() => { try { return JSON.parse(comentarioMap[cita.id] || "{}").comentario; } catch { return ""; } })()}
                </p>
              </div>
            )}
            {cita.estado !== "realizada" ? (
              <div className="mt-5 grid grid-cols-3 gap-2">
                {["confirmada", "cancelada", "no_asistio"].map((estado) => (
                  <form action={updateMiCita} key={estado}>
                    <input name="citaId" type="hidden" value={cita.id} />
                    <input name="estado" type="hidden" value={estado} />
                    <button className="w-full rounded-lg border border-slate-600/50 bg-slate-700 px-2 py-2 text-[11px] font-medium capitalize text-slate-200 transition hover:bg-slate-600" type="submit">
                      {estado.replace("_", " ")}
                    </button>
                  </form>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </section>

      {agenda.citas.length === 0 && (
        <section className="rounded-xl border border-slate-700/50 bg-slate-900/80 p-8 text-center text-sm text-muted-foreground shadow-sm">
          No hay citas asignadas.
        </section>
      )}
    </div>
  );
}
