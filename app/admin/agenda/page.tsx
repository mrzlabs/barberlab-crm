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
      <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-300">Agenda completa</p>
        <h2 className="mt-2 text-3xl font-black tracking-tight">Operacion por especialista</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          Vista consolidada para confirmar carga diaria, cliente, servicio, estado y contacto manual por WhatsApp.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {citas.map((cita) => (
          <article className="rounded-2xl border bg-white p-5 shadow-sm" key={cita.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{fmtDateTime(cita.inicio)}</p>
                <h3 className="mt-2 text-xl font-black">{cita.cliente}</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${badge(cita.estado)}`}>{cita.estado}</span>
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Servicio</dt><dd className="font-semibold text-right">{cita.servicio}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Empleado</dt><dd className="font-semibold text-right">{cita.empleado}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Categoria</dt><dd className="font-semibold capitalize">{cita.categoria.replace("_", " ")}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">WhatsApp</dt><dd><a className="font-black text-cyan-700" href={`https://wa.me/57${cita.telefono.replace(/\D/g, "")}`} target="_blank">Contactar</a></dd></div>
            </dl>
          </article>
        ))}
      </section>
    </div>
  );
}
