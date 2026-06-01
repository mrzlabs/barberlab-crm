import Image from "next/image";
import { fmtMoney } from "@/lib/admin/format";
import { getInventario } from "@/lib/admin/queries";
import { SubmitButton } from "@/components/layout/SubmitButton";
import { createItem, createMov, updateInventario } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };

function param(v: string | string[] | undefined) { return Array.isArray(v) ? v[0] : v; }

export default async function InventarioPage({ searchParams }: PageProps) {
  const q = param(searchParams?.q);
  const soloAlertas = param(searchParams?.alertas) === "1";
  const items = await getInventario(q, soloAlertas);
  const alertas = items.filter((item) => Number(item.stock) <= Number(item.stockMinimo) && Number(item.stockMinimo) > 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Items activos</p>
          <strong className="mt-2 block text-3xl font-black">{items.filter((item) => item.activo).length}</strong>
        </article>
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Alertas stock minimo</p>
          <strong className="mt-2 block text-3xl font-black text-red-600">{alertas.length}</strong>
        </article>
        <article className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valor inventario</p>
          <strong className="mt-2 block text-3xl font-black">{fmtMoney(items.reduce((sum, item) => sum + Number(item.stock) * Number(item.costoUnitario), 0))}</strong>
        </article>
      </section>

      {/* ── Panel de reposición urgente ── */}
      {alertas.length > 0 && !soloAlertas && !q && (
        <section className="overflow-hidden rounded-2xl border border-red-200 bg-red-50 shadow-sm">
          <div className="flex items-center gap-3 border-b border-red-200 bg-red-100/60 px-5 py-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-red-600 text-sm font-black text-white">{alertas.length}</span>
            <div>
              <h3 className="font-black text-red-800">Reposición urgente</h3>
              <p className="text-xs text-red-600">Estos productos están por debajo del stock mínimo configurado.</p>
            </div>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {alertas.map((item) => {
              const faltante = Number(item.stockMinimo) - Number(item.stock);
              return (
                <div className="flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-white px-4 py-3" key={item.id}>
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-900">{item.nombre}</p>
                    <p className="text-xs text-slate-500">{item.categoria} · {item.unidad}</p>
                    <p className="mt-1 text-xs font-bold text-red-600">
                      Stock: {item.stock} / Mín: {item.stockMinimo}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-block rounded-xl bg-red-100 px-2.5 py-1 text-xs font-black text-red-700">
                      −{faltante} {item.unidad}
                    </span>
                    <p className="mt-1 text-[10px] text-slate-400">{fmtMoney(item.costoUnitario)}/u</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-2">
        <form action={createItem} className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Catalogo</p>
          <h2 className="mt-1 text-2xl font-black">Nuevo item</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">SKU<input className={input} name="sku" required /></label>
            <label className="text-xs font-bold uppercase text-muted-foreground">Nombre<input className={input} name="nombre" required /></label>
            <label className="text-xs font-bold uppercase text-muted-foreground sm:col-span-2">Descripción<textarea className={input} name="descripcion" rows={3} placeholder="Uso, beneficio, recomendación o nota interna" /></label>
            <label className="text-xs font-bold uppercase text-muted-foreground sm:col-span-2">Foto<input className={input} name="foto" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /></label>
            <label className="text-xs font-bold uppercase text-muted-foreground">Categoria<input className={input} name="categoria" required /></label>
            <label className="text-xs font-bold uppercase text-muted-foreground">Unidad<input className={input} name="unidad" placeholder="ml, unidad, caja" required /></label>
            <label className="text-xs font-bold uppercase text-muted-foreground">Stock<input className={input} defaultValue="0" min="0" name="stock" type="number" /></label>
            <label className="text-xs font-bold uppercase text-muted-foreground">Stock minimo<input className={input} defaultValue="0" min="0" name="stockMinimo" type="number" /></label>
            <label className="text-xs font-bold uppercase text-muted-foreground">Costo unitario<input className={input} defaultValue="0" min="0" name="costoUnitario" type="number" /></label>
            <label className="text-xs font-bold uppercase text-muted-foreground">Precio venta<input className={input} defaultValue="0" min="0" name="precioVenta" type="number" /></label>
            <label className="flex items-end gap-2 text-sm font-semibold"><input defaultChecked name="activo" type="checkbox" />Activo</label>
            <label className="flex items-end gap-2 text-sm font-semibold"><input name="visibleCliente" type="checkbox" />Visible cliente</label>
            <SubmitButton label="Crear item" pendingLabel="Creando…" className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white sm:col-span-2" />
          </div>
        </form>

        <form action={createMov} className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Kardex</p>
          <h2 className="mt-1 text-2xl font-black">Movimiento de inventario</h2>
          <div className="mt-5 grid gap-4">
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Insumo
              <select className={input} name="inventarioId" required>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>{item.nombre} · stock {item.stock}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Tipo
                <select className={input} name="tipo" required>
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                  <option value="ajuste">Ajuste</option>
                </select>
              </label>
              <label className="text-xs font-bold uppercase text-muted-foreground">Cantidad<input className={input} name="cantidad" required type="number" /></label>
            </div>
            <label className="text-xs font-bold uppercase text-muted-foreground">Motivo<input className={input} name="motivo" placeholder="Compra, uso interno, ajuste fisico" required /></label>
            <SubmitButton label="Registrar movimiento" pendingLabel="Registrando…" className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-black text-white" />
          </div>
        </form>
      </section>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-2xl font-black">Inventario</h2>
          <p className="mt-1 text-sm text-muted-foreground">Stock, costo unitario y alertas para cierre de turnos.</p>
          <form className="mt-3 flex flex-wrap gap-2" method="get">
            <input
              className="rounded-xl border bg-white px-3 py-1.5 text-sm outline-none focus:border-cyan-500"
              defaultValue={q ?? ""}
              name="q"
              placeholder="Buscar por nombre o SKU…"
              type="search"
            />
            <button className="rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-black text-white" type="submit">Buscar</button>
            <a
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${soloAlertas ? "bg-red-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-red-300 hover:text-red-600"}`}
              href={soloAlertas ? "/admin/inventario" : "/admin/inventario?alertas=1"}
            >
              {soloAlertas ? "✕ Solo alertas" : "Solo alertas"}
            </a>
            {(q || soloAlertas) && !soloAlertas && <a className="rounded-xl border px-3 py-1.5 text-xs font-bold text-slate-400 hover:bg-slate-50" href="/admin/inventario">Limpiar</a>}
          </form>
          <p className="mt-2 text-xs text-slate-400">{items.length} item{items.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="divide-y">
          {items.map((item) => {
            const low = Number(item.stock) <= Number(item.stockMinimo) && Number(item.stockMinimo) > 0;
            return (
              <div className="p-5" key={item.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    {item.fotoUrl ? (
                      <span className="relative size-10 shrink-0 overflow-hidden rounded-xl ring-1 ring-slate-200">
                        <Image src={item.fotoUrl} alt={item.nombre} className="object-cover" fill sizes="40px" unoptimized />
                      </span>
                    ) : (
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-[10px] font-black text-slate-400">IMG</div>
                    )}
                    <div className="min-w-0">
                      <p className="font-black">{item.nombre} <span className="ml-1 font-mono text-xs text-muted-foreground">{item.sku}</span></p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{item.categoria} · {item.unidad}</p>
                      {item.descripcion && <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">{item.descripcion}</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black">Stock: {item.stock}</span>
                    <span className="text-xs text-muted-foreground">Mín {item.stockMinimo}</span>
                    <span className="text-xs text-muted-foreground">Costo {fmtMoney(item.costoUnitario)}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${low ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{low ? "Reponer" : "OK"}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${item.visibleCliente ? "bg-cyan-50 text-cyan-700" : "bg-slate-100 text-slate-600"}`}>{item.visibleCliente ? "Visible" : "Interno"}</span>
                  </div>
                </div>

                <details className="mt-3">
                  <summary className="cursor-pointer list-none">
                    <span className="inline-flex items-center rounded-xl border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-100">
                      Editar
                    </span>
                  </summary>
                  <form action={updateInventario} className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2">
                    <input name="inventarioId" type="hidden" value={item.id} />
                    <input name="fotoUrl" type="hidden" value={item.fotoUrl || ""} />
                    <label className="text-xs font-bold uppercase text-muted-foreground sm:col-span-2">Nombre<input className={input} name="nombre" defaultValue={item.nombre} required /></label>
                    <label className="text-xs font-bold uppercase text-muted-foreground sm:col-span-2">Descripción<textarea className={input} name="descripcion" rows={3} defaultValue={item.descripcion || ""} /></label>
                    <label className="text-xs font-bold uppercase text-muted-foreground sm:col-span-2">Cambiar foto<input className={input} name="foto" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /></label>
                    <label className="text-xs font-bold uppercase text-muted-foreground">Categoria<input className={input} name="categoria" defaultValue={item.categoria} required /></label>
                    <label className="text-xs font-bold uppercase text-muted-foreground">Unidad<input className={input} name="unidad" defaultValue={item.unidad} required /></label>
                    <label className="text-xs font-bold uppercase text-muted-foreground">Stock minimo<input className={input} name="stockMinimo" type="number" min="0" defaultValue={String(item.stockMinimo)} /></label>
                    <label className="text-xs font-bold uppercase text-muted-foreground">Costo unitario<input className={input} name="costoUnitario" type="number" min="0" defaultValue={String(item.costoUnitario)} /></label>
                    <label className="text-xs font-bold uppercase text-muted-foreground">Precio venta<input className={input} name="precioVenta" type="number" min="0" defaultValue={String(item.precioVenta)} /></label>
                    <div className="flex items-end gap-4 sm:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-semibold"><input name="visibleCliente" type="checkbox" defaultChecked={item.visibleCliente} />Visible cliente</label>
                      <label className="flex items-center gap-2 text-sm font-semibold"><input name="activo" type="checkbox" defaultChecked={item.activo} />Activo</label>
                      <SubmitButton label="Guardar cambios" pendingLabel="Guardando…" className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-black text-white hover:bg-violet-800" />
                    </div>
                  </form>
                </details>
              </div>
            );
          })}
          {items.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">Sin items registrados.</p>
          )}
        </div>
      </section>
    </div>
  );
}
