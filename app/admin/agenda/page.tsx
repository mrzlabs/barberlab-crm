import { fmtDateTime } from "@/lib/admin/format";
import { getAgendaAdmin } from "@/lib/admin/catalog";

export const dynamic = "force-dynamic";

function badge(estado: string) {
  if (estado === "realizada") return "bg-emerald-50 text-emerald-700";
  if (estado === "cancelada" || estado === "no_asistio") return "bg-red-50 text-red-700";
  return "bg-cyan-50 text-cyan-700";
}

export default async function AdminAgendaPage() {
  const citas = await getAgendaAdmin();

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-violet-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(34,211,238,.34),transparent_18rem),radial-gradient(circle_at_78%_35%,rgba(168,85,247,.35),transparent_22rem)]" />
        <div className="relative">
          <div className="mac-dots" />
          <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Agenda completa</p>
          <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Operacion por especialista</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Admin puede controlar toda la agenda, revisar estados, contactar clientes y detectar carga operativa por empleado.
          </p>
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
          </article>
        ))}
      </section>
    </div>
  );
}
