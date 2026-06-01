import Link from "next/link";
import { getClientesAdmin } from "@/lib/admin/catalog";
import { ClienteCreateButton, ClienteEditButton } from "@/components/admin/ClienteModal";
import { createCliente, updateCliente } from "./actions";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };
function param(v: string | string[] | undefined) { return Array.isArray(v) ? v[0] : v; }

export default async function AdminClientesPage({ searchParams }: PageProps) {
  const q = param(searchParams?.q);
  const clientes = await getClientesAdmin(q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">CRM clientes</p>
          <h2 className="text-2xl font-black">Clientes</h2>
        </div>
        <ClienteCreateButton createAction={createCliente} />
      </div>

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
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={item.id}>
            <h3 className="text-xl font-black text-slate-900">{item.nombre}</h3>
            <p className="mt-1 text-sm text-slate-500">{item.email || "Sin email"}</p>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Teléfono</dt><dd className="font-semibold text-slate-900">{item.telefono}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Origen</dt><dd className="font-semibold text-slate-900">{item.usuarioId ? "Cuenta auth" : "Registro manual"}</dd></div>
            </dl>
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{item.notas || "Sin notas"}</p>
            <div className="mt-4 flex items-center gap-2">
              <Link className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700 hover:bg-cyan-100" href={`/admin/clientes/${item.id}`}>
                Ver historial
              </Link>
              <ClienteEditButton
                item={{ id: item.id, nombre: item.nombre, telefono: item.telefono, email: item.email, notas: item.notas }}
                updateAction={updateCliente}
              />
            </div>
          </article>
        ))}
        {clientes.length === 0 && (
          <p className="col-span-2 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">Sin clientes registrados.</p>
        )}
      </div>
    </div>
  );
}
