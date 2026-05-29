import { fmtMoney } from "@/lib/admin/format";
import { getInventario } from "@/lib/admin/queries";
import { createItem, createMov } from "./actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500";

export default async function InventarioPage() {
  const items = await getInventario();
  const alertas = items.filter((item) => Number(item.stock) <= Number(item.stockMinimo));

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

      <section className="grid gap-6 xl:grid-cols-2">
        <form action={createItem} className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Catalogo</p>
          <h2 className="mt-1 text-2xl font-black">Nuevo item</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">
              SKU
              <input className={input} name="sku" required />
            </label>
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Nombre
              <input className={input} name="nombre" required />
            </label>
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Categoria
              <input className={input} name="categoria" required />
            </label>
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Unidad
              <input className={input} name="unidad" placeholder="ml, unidad, caja" required />
            </label>
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Stock
              <input className={input} defaultValue="0" min="0" name="stock" type="number" />
            </label>
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Stock minimo
              <input className={input} defaultValue="0" min="0" name="stockMinimo" type="number" />
            </label>
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Costo unitario
              <input className={input} defaultValue="0" min="0" name="costoUnitario" type="number" />
            </label>
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Precio venta
              <input className={input} defaultValue="0" min="0" name="precioVenta" type="number" />
            </label>
            <label className="flex items-end gap-2 text-sm font-semibold">
              <input defaultChecked name="activo" type="checkbox" />
              Activo
            </label>
            <label className="flex items-end gap-2 text-sm font-semibold">
              <input name="visibleCliente" type="checkbox" />
              Visible cliente
            </label>
            <button className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white sm:col-span-2" type="submit">
              Crear item
            </button>
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
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Cantidad
                <input className={input} name="cantidad" required type="number" />
              </label>
            </div>
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Motivo
              <input className={input} name="motivo" placeholder="Compra, uso interno, ajuste fisico" required />
            </label>
            <button className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-black text-white" type="submit">
              Registrar movimiento
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-2xl font-black">Inventario</h2>
          <p className="mt-1 text-sm text-muted-foreground">Stock, costo unitario y alertas para cierre de turnos.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Insumo</th>
                <th className="px-5 py-3">Categoria</th>
                <th className="px-5 py-3 text-right">Stock</th>
                <th className="px-5 py-3 text-right">Minimo</th>
                <th className="px-5 py-3 text-right">Costo</th>
                <th className="px-5 py-3 text-right">Venta</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const low = Number(item.stock) <= Number(item.stockMinimo);
                return (
                  <tr className="border-t" key={item.id}>
                    <td className="px-5 py-4 font-mono text-xs">{item.sku}</td>
                    <td className="px-5 py-4 font-black">{item.nombre}</td>
                    <td className="px-5 py-4">{item.categoria}</td>
                    <td className="px-5 py-4 text-right">{item.stock} {item.unidad}</td>
                    <td className="px-5 py-4 text-right">{item.stockMinimo}</td>
                    <td className="px-5 py-4 text-right">{fmtMoney(item.costoUnitario)}</td>
                    <td className="px-5 py-4 text-right">{fmtMoney(item.precioVenta)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${item.visibleCliente ? "bg-cyan-50 text-cyan-700" : "bg-slate-100 text-slate-600"}`}>
                        {item.visibleCliente ? "Visible" : "Interno"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-black ${low ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {low ? "Reponer" : "OK"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-muted-foreground" colSpan={9}>Sin items registrados.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
