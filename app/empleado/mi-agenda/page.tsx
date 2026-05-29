import Link from "next/link";
import { fmtDateTime, fmtMoney } from "@/lib/admin/format";
import { requireRole } from "@/lib/auth/session";
import { getMiAgenda } from "@/lib/empleado/queries";

export const dynamic = "force-dynamic";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <strong className="mt-2 block text-3xl font-black">{value}</strong>
    </article>
  );
}

function estadoClass(estado: string) {
  if (estado === "realizada") return "bg-emerald-50 text-emerald-700";
  if (estado === "cancelada" || estado === "no_asistio") return "bg-red-50 text-red-700";
  return "bg-cyan-50 text-cyan-700";
}

export default async function MiAgendaPage() {
  const profile = await requireRole(["empleado"]);
  const agenda = await getMiAgenda(profile.id);

  if (!agenda.empleado) {
    return (
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black">Empleado sin perfil operativo</h2>
        <p className="mt-2 text-sm text-muted-foreground">El usuario existe, pero no tiene registro en la tabla empleados.</p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">Agenda personal</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">{profile.nombre}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Vista operativa de citas asignadas, cliente, servicio, horario y estado.
            </p>
          </div>
          <Link className="rounded-xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950" href="/empleado/cerrar-turno">
            Cerrar turno
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Citas hoy" value={agenda.stats.hoy} />
        <Stat label="Pendientes" value={agenda.stats.pendientes} />
        <Stat label="Realizadas" value={agenda.stats.realizadas} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agenda.citas.map((cita) => (
          <article className="rounded-2xl border bg-white p-5 shadow-sm" key={cita.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{fmtDateTime(cita.inicio)}</p>
                <h3 className="mt-2 text-xl font-black">{cita.cliente}</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${estadoClass(cita.estado)}`}>{cita.estado}</span>
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Servicio</dt>
                <dd className="font-semibold text-right">{cita.servicio}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Duracion</dt>
                <dd className="font-semibold">{cita.duracionMin} min</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Precio base</dt>
                <dd className="font-semibold">{fmtMoney(cita.precio)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">WhatsApp</dt>
                <dd>
                  <a className="font-black text-cyan-700" href={`https://wa.me/57${cita.telefono.replace(/\D/g, "")}`} target="_blank">
                    Contactar
                  </a>
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </section>

      {agenda.citas.length === 0 ? (
        <section className="rounded-2xl border bg-white p-8 text-center text-sm text-muted-foreground shadow-sm">
          No hay citas asignadas.
        </section>
      ) : null}
    </div>
  );
}
