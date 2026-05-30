import { getEmpleadosAdmin } from "@/lib/admin/catalog";
import { SubmitButton } from "@/components/layout/SubmitButton";
import { createEmpleado, toggleEmpleado, updateEmpleado } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };

function param(v: string | string[] | undefined) { return Array.isArray(v) ? v[0] : v; }

export default async function AdminEmpleadosPage({ searchParams }: PageProps) {
  const q = param(searchParams?.q);
  const empleados = await getEmpleadosAdmin(q);

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form action={createEmpleado} className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Equipo operativo</p>
        <h2 className="mt-1 text-2xl font-black">Nuevo empleado</h2>
        <div className="mt-5 grid gap-4">
          <label className="text-xs font-bold uppercase text-muted-foreground">Nombre<input className={input} name="nombre" required /></label>
          <label className="text-xs font-bold uppercase text-muted-foreground">Email<input className={input} name="email" required type="email" /></label>
          <label className="text-xs font-bold uppercase text-muted-foreground">Password inicial<input className={input} name="password" required minLength={8} type="password" placeholder="Minimo 8 caracteres" /></label>
          <label className="text-xs font-bold uppercase text-muted-foreground">Telefono<input className={input} name="telefono" required /></label>
          <label className="text-xs font-bold uppercase text-muted-foreground">Especialidad<select className={input} name="especialidad"><option value="barberia">Barberia</option><option value="peluqueria">Peluqueria</option><option value="spa_unas">Spa de unas</option><option value="tatuajes">Tatuajes</option></select></label>
          <label className="text-xs font-bold uppercase text-muted-foreground">Comision %<input className={input} name="comisionPct" required type="number" defaultValue="40" /></label>
          <label className="flex items-center gap-2 text-sm font-semibold"><input name="activo" type="checkbox" defaultChecked />Activo</label>
          <SubmitButton label="Guardar empleado" pendingLabel="Guardando…" className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white" />
        </div>
      </form>

      <section className="space-y-4">
        <form className="flex gap-2" method="get">
          <input
            className="flex-1 rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500"
            defaultValue={q ?? ""}
            name="q"
            placeholder="Buscar por nombre…"
            type="search"
          />
          <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white" type="submit">Buscar</button>
          {q && <a className="rounded-xl border px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50" href="/admin/empleados">Limpiar</a>}
        </form>
        <p className="text-xs text-slate-400">{empleados.length} empleado{empleados.length !== 1 ? "s" : ""}{q ? ` para "${q}"` : ""}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {empleados.map((item) => (
          <article className="rounded-2xl border bg-white p-5 shadow-sm" key={item.id}>
            <div className="flex items-start justify-between gap-3">
              <div><h3 className="text-xl font-black">{item.nombre}</h3><p className="mt-1 text-sm text-muted-foreground">{item.email}</p></div>
              <form action={toggleEmpleado}>
                <input name="empleadoId" type="hidden" value={item.id} />
                <input name="usuarioId" type="hidden" value={item.usuarioId} />
                <input name="activo" type="hidden" value={String(!item.activo)} />
                <button
                  type="submit"
                  title={item.activo ? "Click para desactivar" : "Click para activar"}
                  className={`rounded-full px-3 py-1 text-xs font-black transition hover:opacity-60 ${item.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                >
                  {item.activo ? "Activo" : "Inactivo"}
                </button>
              </form>
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Especialidad</dt><dd className="font-semibold capitalize">{item.especialidad.replace("_", " ")}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Comision</dt><dd className="font-semibold">{item.comisionPct}%</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Telefono</dt><dd className="font-semibold">{item.telefono}</dd></div>
            </dl>

            <details className="mt-4">
              <summary className="cursor-pointer list-none">
                <span className="inline-flex items-center rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100">
                  Editar
                </span>
              </summary>
              <form action={updateEmpleado} className="mt-4 grid gap-3 border-t pt-4">
                <input name="empleadoId" type="hidden" value={item.id} />
                <input name="usuarioId" type="hidden" value={item.usuarioId} />
                <label className="text-xs font-bold uppercase text-muted-foreground">Nombre<input className={input} name="nombre" defaultValue={item.nombre} required /></label>
                <label className="text-xs font-bold uppercase text-muted-foreground">Telefono<input className={input} name="telefono" defaultValue={item.telefono || ""} required /></label>
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Especialidad
                  <select className={input} name="especialidad" defaultValue={item.especialidad}>
                    <option value="barberia">Barberia</option>
                    <option value="peluqueria">Peluqueria</option>
                    <option value="spa_unas">Spa de unas</option>
                    <option value="tatuajes">Tatuajes</option>
                  </select>
                </label>
                <label className="text-xs font-bold uppercase text-muted-foreground">Comision %<input className={input} name="comisionPct" type="number" min="0" max="100" defaultValue={item.comisionPct} /></label>
                <label className="flex items-center gap-2 text-sm font-semibold"><input name="activo" type="checkbox" defaultChecked={item.activo} />Activo</label>
                <SubmitButton label="Guardar cambios" pendingLabel="Guardando…" className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-black text-white hover:bg-violet-800" />
              </form>
            </details>
          </article>
        ))}
      </div>
      </section>
    </div>
  );
}
