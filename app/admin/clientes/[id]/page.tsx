import { notFound } from "next/navigation";
import Link from "next/link";
import { fmtDateTime, fmtMoney } from "@/lib/admin/format";
import { getClienteDetalle } from "@/lib/admin/catalog";
import { requireRole } from "@/lib/auth/session";
import { SubmitButton } from "@/components/layout/SubmitButton";
import { ClienteBookUpload } from "@/components/admin/ClienteBookUpload";
import { deleteClienteArchivo, updateDepositoEstado } from "./actions";

export const dynamic = "force-dynamic";

const TIPO_LABELS: Record<string, { label: string; color: string }> = {
  boceto:     { label: "Boceto",     color: "#7F77DD" },
  referencia: { label: "Referencia", color: "#F5C400" },
  resultado:  { label: "Resultado",  color: "#27C3D8" },
  otro:       { label: "Otro",       color: "#8a8a9c" },
};

const DEP_ESTADO: Record<string, { label: string; bg: string; color: string }> = {
  recibido: { label: "Recibido",  bg: "#F5C40015", color: "#F5C400" },
  aplicado: { label: "Aplicado",  bg: "#27C3D815", color: "#27C3D8" },
  devuelto: { label: "Devuelto",  bg: "#f9731615", color: "#f97316" },
};

function badge(estado: string) {
  if (estado === "realizada")   return "bg-emerald-500/20 text-emerald-300";
  if (estado === "cancelada" || estado === "no_asistio") return "bg-red-500/20 text-red-300";
  if (estado === "confirmada")  return "bg-violet-500/20 text-violet-300";
  return "bg-cyan-500/20 text-cyan-300";
}

const inputCls = "w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20";

type PageProps = { params: { id: string } };

export default async function ClienteDetallePage({ params }: PageProps) {
  const profile = await requireRole(["admin", "super_admin"]);
  const { cliente, citas, archivos, depositos } = await getClienteDetalle(params.id, profile.negocioId!);

  if (!cliente) notFound();

  const realizadas      = citas.filter((c) => c.estado === "realizada");
  const totalGastado    = realizadas.reduce((s, c) => s + Number(c.precioFinal ?? 0) + Number(c.propina ?? 0), 0);
  const ticketPromedio  = realizadas.length ? totalGastado / realizadas.length : 0;
  const ultimaVisita    = realizadas[0]?.inicio ?? null;
  const noAsistio       = citas.filter((c) => c.estado === "no_asistio").length;
  const tasaInasistencia = citas.length ? ((noAsistio / citas.length) * 100).toFixed(0) : "0";
  const totalDepositos  = depositos.filter((d) => d.estado === "recibido").reduce((s, d) => s + Number(d.monto), 0);

  return (
    <div className="space-y-6">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[#0e0e16] border border-[#23232f] p-6 shadow-2xl sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(127,119,221,.22),transparent_16rem),radial-gradient(circle_at_84%_70%,rgba(39,195,216,.16),transparent_18rem)]" />
        <div className="relative">
          <Link className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white" href="/admin/clientes">
            ← Volver a clientes
          </Link>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-400">Perfil cliente</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{cliente.nombre}</h2>
              <p className="mt-1 text-sm text-slate-400">{cliente.email || "Sin email"} · {cliente.telefono}</p>
              {cliente.notas && (
                <p className="mt-2 max-w-xl rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm leading-6 text-slate-400">{cliente.notas}</p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <a
                className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-500"
                href={`https://wa.me/57${cliente.telefono.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
              {totalDepositos > 0 && (
                <span className="self-center rounded-full bg-[#F5C40015] border border-[#F5C40030] px-3 py-1 text-xs font-black text-[#F5C400]">
                  💰 {fmtMoney(totalDepositos)} en depósitos
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── KPIs ── */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {[
          { label: "Visitas realizadas",  value: String(realizadas.length), sub: `de ${citas.length} citas` },
          { label: "Total invertido",     value: fmtMoney(totalGastado),    sub: "precio + propinas" },
          { label: "Ticket promedio",     value: fmtMoney(ticketPromedio),  sub: "por visita" },
          { label: "Última visita",       value: ultimaVisita ? fmtDateTime(ultimaVisita) : "—", sub: "cita realizada" },
          { label: "Tasa inasistencia",   value: `${tasaInasistencia}%`,    sub: `${noAsistio} no asistió` },
        ].map((kpi) => (
          <article
            key={kpi.label}
            style={{ background: "#13131c", border: "1px solid #23232f" }}
            className="rounded-2xl p-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{kpi.label}</p>
            <strong className="mt-2 block truncate text-lg font-black">{kpi.value}</strong>
            <p className="mt-1 truncate text-xs text-slate-400">{kpi.sub}</p>
          </article>
        ))}
      </section>

      {/* ── Depósitos ── */}
      <section style={{ background: "#13131c", border: "1px solid #23232f" }} className="overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-[#23232f] px-5 py-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#F5C400]">Anticipos</p>
            <h3 className="mt-0.5 font-black">Depósitos y anticipos</h3>
          </div>
          <span style={{ background: "#F5C40015", color: "#F5C400", border: "1px solid #F5C40030" }}
            className="rounded-full px-3 py-1 text-xs font-bold">
            {depositos.length} registros
          </span>
        </div>

        <div className="border-b border-[#1b1b27] p-5">
          <p className="mb-3 text-xs font-semibold text-slate-400">Registrar nuevo depósito</p>
          <form
            action={async (fd) => {
              "use server";
              const { createDeposito } = await import("@/app/admin/agenda/actions");
              await createDeposito(fd);
            }}
            className="grid gap-3 sm:grid-cols-4"
          >
            <input name="clienteId" type="hidden" value={cliente.id} />
            <input name="citaId" type="hidden" value={citas[0]?.citaId ?? ""} />
            <label className="text-xs font-bold uppercase text-slate-400">
              Monto
              <input className={inputCls} name="monto" min="1" required type="number" placeholder="50000" />
            </label>
            <label className="text-xs font-bold uppercase text-slate-400">
              Método de pago
              <select className={inputCls} name="metodoPago" required>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
              </select>
            </label>
            <label className="text-xs font-bold uppercase text-slate-400">
              Notas
              <input className={inputCls} name="notas" placeholder="Ej: Anticipo manga completa" />
            </label>
            <div className="flex items-end">
              <SubmitButton label="Registrar depósito" pendingLabel="Registrando…"
                className="w-full rounded-xl bg-[#F5C400] px-4 py-2.5 text-sm font-black text-slate-900 hover:bg-[#FFE680]" />
            </div>
          </form>
        </div>

        <div className="divide-y divide-[#1b1b27]">
          {depositos.map((dep) => {
            const st = DEP_ESTADO[dep.estado] ?? DEP_ESTADO.recibido;
            return (
              <div key={dep.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div>
                  <strong className="text-sm font-black">{fmtMoney(Number(dep.monto))}</strong>
                  <span className="ml-2 text-xs text-slate-400 capitalize">{dep.metodoPago}</span>
                  {dep.notas && <p className="text-xs text-slate-500 mt-0.5">{dep.notas}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ background: st.bg, color: st.color }} className="rounded-full px-2.5 py-0.5 text-[11px] font-black border border-current/20">
                    {st.label}
                  </span>
                  {dep.estado === "recibido" && (
                    <form action={updateDepositoEstado}>
                      <input name="depositoId" type="hidden" value={dep.id} />
                      <input name="clienteId"  type="hidden" value={cliente.id} />
                      <input name="estado"     type="hidden" value="devuelto" />
                      <SubmitButton label="Devolver" pendingLabel="…"
                        className="rounded-lg border border-white/10 bg-transparent px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:text-red-400" />
                    </form>
                  )}
                </div>
              </div>
            );
          })}
          {depositos.length === 0 && (
            <p className="p-6 text-center text-sm text-slate-500">Sin depósitos registrados.</p>
          )}
        </div>
      </section>

      {/* ── Book / Diseños ── */}
      <section style={{ background: "#13131c", border: "1px solid #23232f" }} className="overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-[#23232f] px-5 py-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7F77DD]">Book digital</p>
            <h3 className="mt-0.5 font-black">Diseños e imágenes del cliente</h3>
            <p className="text-xs text-slate-500 mt-0.5">Bocetos, referencias y resultados de sesiones.</p>
          </div>
          <span style={{ background: "#7F77DD15", color: "#7F77DD", border: "1px solid #7F77DD30" }}
            className="rounded-full px-3 py-1 text-xs font-bold">
            {archivos.length} archivos
          </span>
        </div>

        {/* Upload directo a Supabase Storage */}
        <div className="border-b border-[#1b1b27] p-5">
          <p className="mb-4 text-xs font-semibold text-slate-400">Subir imagen al book</p>
          <ClienteBookUpload
            clienteId={cliente.id}
            negocioId={profile.negocioId!}
            citaId={citas[0]?.citaId}
          />
        </div>

        {/* Galería */}
        {archivos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4">
            {archivos.map((arch) => {
              const tipo = TIPO_LABELS[arch.tipo] ?? TIPO_LABELS.otro;
              return (
                <div key={arch.id} style={{ border: "1px solid #23232f" }} className="group relative overflow-hidden rounded-2xl bg-[#0e0e16]">
                  <img
                    src={arch.url}
                    alt={arch.nombre}
                    className="h-44 w-full object-cover transition group-hover:opacity-80"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x400/13131c/6a6a7c?text=Sin+imagen"; }}
                  />
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span style={{ background: tipo.color + "20", color: tipo.color }} className="rounded-full px-2 py-0.5 text-[10px] font-black">
                        {tipo.label}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-300 truncate">{arch.nombre}</p>
                    {arch.descripcion && <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{arch.descripcion}</p>}
                  </div>
                  <form action={deleteClienteArchivo} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                    <input name="archivoId" type="hidden" value={arch.id} />
                    <input name="clienteId" type="hidden" value={cliente.id} />
                    <SubmitButton label="✕" pendingLabel="…"
                      className="rounded-full bg-red-600/80 px-2 py-1 text-xs font-black text-white hover:bg-red-500 backdrop-blur" />
                  </form>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="p-8 text-center text-sm text-slate-500">Sin imágenes en el book todavía.</p>
        )}
      </section>

      {/* ── Historial de citas ── */}
      <section style={{ background: "#13131c", border: "1px solid #23232f" }} className="overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-[#23232f] px-5 py-4">
          <div>
            <h3 className="font-black">Historial de citas</h3>
            <p className="text-xs text-slate-500">Todas las visitas registradas para este cliente.</p>
          </div>
          <span style={{ background: "#27C3D815", color: "#27C3D8", border: "1px solid #27C3D830" }}
            className="rounded-full px-3 py-1 text-xs font-bold">
            {citas.length} citas
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead style={{ background: "#0e0e16" }} className="text-[10px] uppercase tracking-wide text-slate-500">
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
                <tr key={c.citaId} style={{ borderTop: "1px solid #1b1b27" }}
                  className={`transition hover:bg-white/[0.03] ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}>
                  <td className="px-5 py-3.5 tabular-nums text-slate-300">{fmtDateTime(c.inicio)}</td>
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
                      : <span className="text-slate-600">—</span>}
                  </td>
                  <td className="px-5 py-3.5 capitalize text-slate-500">{c.metodoPago ?? "—"}</td>
                </tr>
              ))}
              {citas.length === 0 && (
                <tr><td className="px-5 py-8 text-center text-slate-500" colSpan={6}>Sin citas registradas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
