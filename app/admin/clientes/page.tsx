import Link from "next/link";
import { getClientesAdmin } from "@/lib/admin/catalog";
import { SubmitButton } from "@/components/layout/SubmitButton";
import { createCliente, updateCliente } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };

function param(v: string | string[] | undefined) { return Array.isArray(v) ? v[0] : v; }

export default async function AdminClientesPage({ searchParams }: PageProps) {
  const q = param(searchParams?.q);
  const clientes = await getClientesAdmin(q);

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form action={createCliente} className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">CRM clientes</p>
        <h2 className="mt-1 text-2xl font-black">Nuevo cliente</h2>
        <div className="mt-5 grid gap-4">
          <label className="text-xs font-bold uppercase text-muted-foreground">Nombre<input className={input} name="nombre" required /></label>
          <label className="text-xs font-bold uppercase text-muted-foreground">Telefono<input className={input} name="telefono" required /></label>
          <label className="text-xs font-bold uppercase text-muted-foreground">Email<input className={input} name="email" type="email" /></label>
          <label className="text-xs font-bold uppercase text-muted-foreground">Password si crea cuenta<input className={input} name="password" minLength={8} type="password" /></label>
          <label className="flex items-center gap-2 text-sm font-semibold"><input name="crearCuenta" type="checkbox" />Crear acceso cliente</label>
          <label className="text-xs font-bold uppercase text-muted-foreground">Notas<textarea className={input} name="notas" rows={4} /></label>
          <SubmitButton label="Guardar cliente" pendingLabel="Guardando…" className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white" />
        </div>
      </form>

      <section className="space-y-4">
        <form className="flex gap-2" method="get">
          <input
            className="flex-1 rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500"
            defaultValue={q ?? ""}
            name="q"
            placeholder="Buscar por nombre o teléfono…"
            type="search"
          />
          <button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white" type="submit">Buscar</button>
          {q && <a className="rounded-xl border px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50" href="/admin/clientes">Limpiar</a>}
        </form>
        <p className="text-xs text-slate-400">{clientes.length} cliente{clientes.length !== 1 ? "s" : ""}{q ? ` para "${q}"` : ""}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {clientes.map((item) => (
          <article className="rounded-2xl border bg-white p-5 shadow-sm" key={item.id}>
            <h3 className="text-xl font-black">{item.nombre}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.email || "Sin email"}</p>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Telefono</dt><dd className="font-semibold">{item.telefono}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Origen</dt><dd className="font-semibold">{item.usuarioId ? "Cuenta auth" : "Registro manual"}</dd></div>
            </dl>
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-muted-foreground">{item.notas || "Sin notas"}</p>

            <div className="mt-4 flex items-center gap-2">
              <Link
                className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700 hover:bg-cyan-100"
                href={`/admin/clientes/${item.id}`}
              >
                Ver historial
              </Link>
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer list-none">
                <span className="inline-flex items-center rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100">
                  Editar
                </span>
              </summary>
              <form action={updateCliente} className="mt-4 grid gap-3 border-t pt-4">
                <input name="clienteId" type="hidden" value={item.id} />
                <label className="text-xs font-bold uppercase text-muted-foreground">Nombre<input className={input} name="nombre" defaultValue={item.nombre} required /></label>
                <label className="text-xs font-bold uppercase text-muted-foreground">Telefono<input className={input} name="telefono" defaultValue={item.telefono} required /></label>
                <label className="text-xs font-bold uppercase text-muted-foreground">Email<input className={input} name="email" type="email" defaultValue={item.email || ""} /></label>
                <label className="text-xs font-bold uppercase text-muted-foreground">Notas<textarea className={input} name="notas" rows={3} defaultValue={item.notas || ""} /></label>
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
