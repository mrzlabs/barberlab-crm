import { getClientesAdmin } from "@/lib/admin/catalog";
import { createCliente } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500";

export default async function AdminClientesPage() {
  const clientes = await getClientesAdmin();

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form action={createCliente} className="h-fit rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">CRM clientes</p>
        <h2 className="mt-1 text-2xl font-black">Nuevo cliente</h2>
        <div className="mt-5 grid gap-4">
          <label className="text-xs font-bold uppercase text-muted-foreground">Nombre<input className={input} name="nombre" required /></label>
          <label className="text-xs font-bold uppercase text-muted-foreground">Telefono<input className={input} name="telefono" required /></label>
          <label className="text-xs font-bold uppercase text-muted-foreground">Email<input className={input} name="email" type="email" /></label>
          <label className="text-xs font-bold uppercase text-muted-foreground">Notas<textarea className={input} name="notas" rows={4} /></label>
          <button className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white" type="submit">Guardar cliente</button>
        </div>
      </form>

      <section className="grid gap-4 md:grid-cols-2">
        {clientes.map((item) => (
          <article className="rounded-2xl border bg-white p-5 shadow-sm" key={item.id}>
            <h3 className="text-xl font-black">{item.nombre}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.email || "Sin email"}</p>
            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Telefono</dt><dd className="font-semibold">{item.telefono}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Origen</dt><dd className="font-semibold">{item.usuarioId ? "Cuenta auth" : "Registro manual"}</dd></div>
            </dl>
            <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-muted-foreground">{item.notas || "Sin notas"}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
