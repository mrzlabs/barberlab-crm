import { getEmpleadosAdmin } from "@/lib/admin/catalog";
import { EmpleadoCreateButton, EmpleadoEditButton } from "@/components/admin/EmpleadoModal";
import { SubmitButton } from "@/components/layout/SubmitButton";
import { createEmpleado, toggleEmpleado, updateEmpleado } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };
function param(v: string | string[] | undefined) { return Array.isArray(v) ? v[0] : v; }

export default async function AdminEmpleadosPage({ searchParams }: PageProps) {
  const q = param(searchParams?.q);
  const empleados = await getEmpleadosAdmin(q);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Equipo operativo</p>
          <h2 className="text-2xl font-black">Empleados</h2>
        </div>
        <EmpleadoCreateButton createAction={createEmpleado} />
      </div>

      {/* ── Search ── */}
      <form className="flex gap-2" method="get">
        <input
          className="flex-1 rounded-xl border bg-white/10 border-white/15 text-white placeholder:text-slate-500 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20"
          defaultValue={q ?? ""}
          name="q"
          placeholder="Buscar por nombre…"
          type="search"
        />
        <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white" type="submit">Buscar</button>
        {q && <a className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-400 hover:bg-white/8" href="/admin/empleados">Limpiar</a>}
      </form>
      <p className="text-xs text-slate-400">{empleados.length} empleado{empleados.length !== 1 ? "s" : ""}{q ? ` para "${q}"` : ""}</p>

      {/* ── List ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {empleados.map((item) => (
          <article className="rounded-2xl border border-white/10 bg-white/8 backdrop-blur-md p-5 shadow-black/20" key={item.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-white">{item.nombre}</h3>
                <p className="mt-1 text-sm text-slate-400">{item.email}</p>
              </div>
              <form action={toggleEmpleado}>
                <input name="empleadoId" type="hidden" value={item.id} />
                <input name="usuarioId" type="hidden" value={item.usuarioId} />
                <input name="activo" type="hidden" value={String(!item.activo)} />
                <SubmitButton
                  label={item.activo ? "Activo" : "Inactivo"}
                  pendingLabel="…"
                  className={`rounded-full px-3 py-1 text-xs font-black transition hover:opacity-60 ${item.activo ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/8 text-slate-300 border border-white/10"}`}
                />
              </form>
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-400">Especialidad</dt><dd className="font-semibold text-slate-200 capitalize">{item.especialidad.replace("_", " ")}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-400">Comisión</dt><dd className="font-semibold text-slate-200">{item.comisionPct}%</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-400">Teléfono</dt><dd className="font-semibold text-slate-200">{item.telefono}</dd></div>
            </dl>
            <div className="mt-4">
              <EmpleadoEditButton
                item={{ id: item.id, usuarioId: item.usuarioId, nombre: item.nombre, telefono: item.telefono, especialidad: item.especialidad, comisionPct: item.comisionPct, activo: item.activo }}
                updateAction={updateEmpleado}
              />
            </div>
          </article>
        ))}
        {empleados.length === 0 && (
          <p className="col-span-2 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-400">Sin empleados registrados.</p>
        )}
      </div>
    </div>
  );
}
