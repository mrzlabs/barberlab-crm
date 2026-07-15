import Image from "next/image";
import Link from "next/link";
import { Package, AlertTriangle } from "lucide-react";
import { fmtMoney } from "@/lib/admin/format";
import { getCategoriasInventario, getInventario } from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth/session";
import { InventarioCreateButton, InventarioEditButton } from "@/components/admin/InventarioModal";
import { createItem, createMov, updateInventario } from "./actions";
import { SubmitButton } from "@/components/layout/SubmitButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stat } from "@/components/ui/Stat";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Field } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };
function param(v: string | string[] | undefined) { return Array.isArray(v) ? v[0] : v; }

export default async function InventarioPage({ searchParams }: PageProps) {
  const profile = await requireRole(["admin", "super_admin"]).catch(() => null);
  const negocioId = profile?.negocioId ?? "00000000-0000-0000-0000-000000000000";
  const q = param(searchParams?.q);
  const soloAlertas = param(searchParams?.alertas) === "1";
  const [items, categorias] = await Promise.all([
    getInventario(negocioId, q, soloAlertas),
    getCategoriasInventario(negocioId),
  ]);
  const alertas = items.filter((item) => Number(item.stock) <= Number(item.stockMinimo) && Number(item.stockMinimo) > 0);
  const valor = items.reduce((sum, item) => sum + Number(item.stock) * Number(item.costoUnitario), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventario"
        description="Stock, costo unitario y alertas para el cierre de turnos."
        actions={<InventarioCreateButton createAction={createItem} categorias={categorias} />}
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat label="Items activos" value={items.filter((item) => item.activo).length} />
        <Stat label="Alertas stock mínimo" value={alertas.length} detail={alertas.length ? "Requieren reposición" : "Todo en orden"} />
        <Stat label="Valor inventario" value={fmtMoney(valor)} detail="Stock × costo unitario" />
      </section>

      {alertas.length > 0 && !soloAlertas && !q && (
        <div className="overflow-hidden rounded-card border border-ds-danger/30 bg-ds-danger-tint">
          <div className="flex items-center gap-3 border-b border-ds-danger/20 px-5 py-3.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ds-danger text-sm font-semibold text-white">{alertas.length}</span>
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-ds-danger">
                <AlertTriangle className="size-4" /> Reposición urgente
              </h3>
              <p className="text-[12px] text-ds-danger/80">Estos productos están por debajo del stock mínimo configurado.</p>
            </div>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {alertas.map((item) => {
              const faltante = Number(item.stockMinimo) - Number(item.stock);
              return (
                <div className="flex items-start justify-between gap-3 rounded-control border border-ds-danger/20 bg-ds-surface px-4 py-3" key={item.id}>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ds-fg">{item.nombre}</p>
                    <p className="text-[12px] text-ds-fg-muted">{item.categoria} · {item.unidad}</p>
                    <p className="ds-nums mt-1 text-[12px] font-medium text-ds-danger">Stock: {item.stock} / Mín: {item.stockMinimo}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="ds-nums inline-block rounded-full bg-ds-danger-tint px-2 py-0.5 text-[12px] font-medium text-ds-danger">−{faltante} {item.unidad}</span>
                    <p className="ds-nums mt-1 text-[11px] text-ds-fg-muted">{fmtMoney(item.costoUnitario)}/u</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Kardex */}
      <Card>
        <form action={createMov} className="p-5">
          <p className="text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Kardex</p>
          <h2 className="text-base font-semibold text-ds-fg">Registrar movimiento</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Insumo" htmlFor="mov-insumo">
              <Select id="mov-insumo" name="inventarioId" required>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>{item.nombre} · stock {item.stock}</option>
                ))}
              </Select>
            </Field>
            <Field label="Tipo" htmlFor="mov-tipo">
              <Select id="mov-tipo" name="tipo" required>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
              </Select>
            </Field>
            <Field label="Cantidad" htmlFor="mov-cant">
              <Input id="mov-cant" name="cantidad" required type="number" />
            </Field>
            <Field label="Motivo" htmlFor="mov-motivo">
              <Input id="mov-motivo" name="motivo" placeholder="Compra, uso interno, ajuste" required />
            </Field>
          </div>
          <div className="mt-4">
            <SubmitButton label="Registrar movimiento" pendingLabel="Registrando…" className="inline-flex h-control items-center rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover" />
          </div>
        </form>
      </Card>

      {/* Search + List */}
      <div className="overflow-hidden rounded-card border border-ds-border bg-ds-surface shadow-ds-sm">
        <div className="border-b border-ds-border p-5">
          <form className="flex flex-wrap gap-2" method="get">
            <Input className="w-auto flex-1 min-w-[200px]" defaultValue={q ?? ""} name="q" placeholder="Buscar por nombre o SKU…" type="search" />
            <button className="h-control rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover" type="submit">Buscar</button>
            <Link
              className={`inline-flex h-control items-center rounded-control px-3 text-[13px] font-medium transition-colors ${
                soloAlertas ? "bg-ds-danger text-white" : "border border-ds-border bg-ds-surface text-ds-fg-muted hover:border-ds-border-strong hover:text-ds-fg"
              }`}
              href={soloAlertas ? "/admin/inventario" : "/admin/inventario?alertas=1"}
            >
              {soloAlertas ? "✕ Solo alertas" : "Solo alertas"}
            </Link>
          </form>
          <p className="mt-2 text-[12px] text-ds-fg-muted">{items.length} item{items.length !== 1 ? "s" : ""}</p>
        </div>

        {items.length === 0 ? (
          <div className="p-5"><EmptyState icon={Package} title="Sin items registrados" description="Crea el primer producto o insumo." /></div>
        ) : (
          <div className="divide-y divide-ds-border">
            {items.map((item) => {
              const low = Number(item.stock) <= Number(item.stockMinimo) && Number(item.stockMinimo) > 0;
              return (
                <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4" key={item.id}>
                  <div className="flex min-w-0 gap-3">
                    {item.fotoUrl ? (
                      <span className="relative size-10 shrink-0 overflow-hidden rounded-control border border-ds-border">
                        <Image src={item.fotoUrl} alt={item.nombre} className="object-cover" fill sizes="40px" unoptimized />
                      </span>
                    ) : (
                      <div className="grid size-10 shrink-0 place-items-center rounded-control bg-ds-surface-2 text-[10px] font-semibold text-ds-fg-subtle">IMG</div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-ds-fg">{item.nombre} <span className="ml-1 font-mono text-[12px] text-ds-fg-subtle">{item.sku}</span></p>
                      <p className="mt-0.5 text-[13px] text-ds-fg-muted">{item.categoria} · {item.unidad}</p>
                      {item.descripcion && <p className="mt-1 max-w-xl text-[12px] leading-5 text-ds-fg-subtle">{item.descripcion}</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="ds-nums text-sm font-semibold text-ds-fg">Stock: {item.stock}</span>
                    <span className="ds-nums text-[12px] text-ds-fg-muted">Mín {item.stockMinimo}</span>
                    <span className="ds-nums text-[12px] text-ds-fg-muted">Costo {fmtMoney(item.costoUnitario)}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${low ? "bg-ds-danger-tint text-ds-danger" : "bg-ds-success-tint text-ds-success"}`}>{low ? "Reponer" : "OK"}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${item.visibleCliente ? "bg-ds-primary-tint text-ds-primary" : "bg-ds-surface-2 text-ds-fg-muted"}`}>{item.visibleCliente ? "Visible" : "Interno"}</span>
                    <InventarioEditButton
                      item={{ id: item.id, nombre: item.nombre, sku: item.sku, categoria: item.categoria, unidad: item.unidad, stock: item.stock, stockMinimo: item.stockMinimo, costoUnitario: item.costoUnitario, precioVenta: item.precioVenta, descripcion: item.descripcion, fotoUrl: item.fotoUrl, activo: item.activo, visibleCliente: item.visibleCliente }}
                      updateAction={updateInventario}
                      categorias={categorias}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
