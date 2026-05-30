import { notFound } from "next/navigation";
import Link from "next/link";
import { fmtDateTime, fmtMoney } from "@/lib/admin/format";
import { getClienteDetalle } from "@/lib/admin/catalog";
import { requireRole } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

function badge(estado: string) {
  if (estado === "realizada") return "bg-emerald-50 text-emerald-700";
  if (estado === "cancelada" || estado === "no_asistio") return "bg-red-50 text-red-700";
  if (estado === "confirmada") return "bg-violet-50 text-violet-700";
  return "bg-cyan-50 text-cyan-700";
}

type PageProps = { params: { id: string } };

export default async function ClienteDetallePage({ params }: PageProps) {
  const profile = await requireRole(["admin", "super_admin"]);
  const { cliente, citas } = await getClienteDetalle(params.id, profile.negocioId!);

  if (!cliente) notFound();

  const realizadas = citas.filter((c) => c.estado === "realizada");
  const totalGastado = realizadas.reduce((sum, c) => sum + Number(c.precioFinal ?? 0) + Number(c.propina ?? 0), 0);
  const ticketPromedio = realizadas.length ? totalGastado / realizadas.length : 0;
  const ultimaVisita = realizadas[0]?.inicio ?? null;
  const noAsistio = citas.filter((c) => c.estado === "no_asistio").length;
  const tasaInasistencia = citas.length ? ((noAsistio / citas.length) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-violet-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(34,211,238,.30),transparent_16rem),radial-gradient(circle_at_84%_70%,rgba(168,85,247,.34),transparent_18rem)]" />
        <div className="relative">
          <Link className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white" href="/admin/clientes">
            ← Volver a clientes
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200">Perfil cliente</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{cliente.nombre}</h2>
              <p className="mt-1 text-sm text-slate-400">{cliente.email || "Sin email"} · {cliente.telefono}</p>
              {cliente.notas && (
                <p className="mt-2 max-w-xl rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm leading-6 text-slate-300">{cliente.notas}</p>
              )}
            </div>
            <div className="flex gap-2">
              <a
                className="rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-400"
                href={`https://wa.me/57${cliente.telefono.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
              <span className={`self-center rounded-full px-3 py-1 text-xs font-black ${cliente.usuarioId ? "bg-cyan-300 text-slate-950" : "bg-white/10 text-slate-300"}`}>
                {cliente.usuarioId ? "Tiene cuenta" : "Sin cuenta"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── KPIs ── */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {[
          { label: "Visitas realizadas", value: String(realizadas.length), sub: `de ${citas.length} citas totales` },
          { label: "Total invertido", value: fmtMoney(totalGastado), sub: "precio + propinas" },
          { label: "Ticket promedio", value: fmtMoney(ticketPromedio), sub: "por visita realizada" },
          { label: "Ultima visita", value: ultimaVisita ? fmtDateTime(ultimaVisita) : "—", sub: "cita realizada" },
          { label: "Tasa inasistencia", value: `${tasaInasistencia}%`, sub: `${noAsistio} no asistio` },
        ].map((kpi) => (
          <article className="rounded-2xl border bg-white p-4 shadow-sm" key={kpi.label}>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{kpi.label}</p>
            <strong className="mt-2 block truncate text-lg font-black tracking-tight">{kpi.value}</strong>
            <p className="mt-1 truncate text-xs text-slate-400">{kpi.sub}</p>
          </article>
        ))}
      </section>

      {/* ── Historial de citas ── */}
      <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h3 className="font-black">Historial completo</h3>
            <p className="text-xs text-slate-500">Todas las citas registradas para este cliente.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{citas.length} citas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-950 text-[10px] uppercase tracking-wide text-cyan-100">
              <tr>
                <th className="px-5 py-3">Fecha</th>
                <th className="px-5 py-3">Servicio</th>
                <th className="px-5 py-3">Especialista</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Cobrado</th>
                <th className="px-5 py-3">Pago</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((c, i) => (
                <tr className={`border-t transition hover:bg-slate-50 ${i % 2 === 0 ? "" : "bg-slate-50/40"}`} key={c.citaId}>
                  <td className="px-5 py-3.5 tabular-nums">{fmtDateTime(c.inicio)}</td>
                  <td className="px-5 py-3.5 font-semibold">{c.servicio}</td>
                  <td className="px-5 py-3.5 text-slate-500">{c.empleado}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${badge(c.estado)}`}>
                      {c.estado.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-black">
                    {c.precioFinal != null
                      ? fmtMoney(Number(c.precioFinal) + Number(c.propina ?? 0))
                      : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5 capitalize text-slate-500">
                    {c.metodoPago ?? "—"}
                  </td>
                </tr>
              ))}
              {citas.length === 0 && (
                <tr><td className="px-5 py-8 text-center text-slate-400" colSpan={6}>Sin citas registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
