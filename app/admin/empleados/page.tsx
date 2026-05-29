import { getEmpleadosAdmin } from "@/lib/admin/catalog";
import { createEmpleado } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500";

export default async function AdminEmpleadosPage() {
  const empleados = await getEmpleadosAdmin();

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
          <button className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white" type="submit">Guardar empleado</button>
        </div>
      </form>

      <section className="grid gap-4 md:grid-cols-2">
        {empleados.map((item) => (
          <article className="rounded-2xl border bg-white p-5 shadow-sm" key={item.id}>
            <div className="flex items-start justify-between gap-3">
              <div><h3 className="text-xl font-black">{item.nombre}</h3><p className="mt-1 text-sm text-muted-foreground">{item.email}</p></div>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${item.activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{item.activo ? "Activo" : "Inactivo"}</span>
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Especialidad</dt><dd className="font-semibold capitalize">{item.especialidad.replace("_", " ")}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Comision</dt><dd className="font-semibold">{item.comisionPct}%</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Telefono</dt><dd className="font-semibold">{item.telefono}</dd></div>
            </dl>
          </article>
        ))}
      </section>
    </div>
  );
}
