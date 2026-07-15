import { Receipt } from "lucide-react";
import { fmtDate, fmtMoney } from "@/lib/admin/format";
import { getGastos } from "@/lib/admin/queries";
import { requireRole } from "@/lib/auth/session";
import { GastoCreateButton, GastoEditButton } from "@/components/admin/GastoModal";
import { createGasto, updateGasto } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

type PageProps = { searchParams?: Record<string, string | string[] | undefined> };
function param(v: string | string[] | undefined) { return Array.isArray(v) ? v[0] : v; }

const CATS = ["", "arriendo", "servicios_publicos", "nomina", "insumos", "marketing", "otros"];

export default async function GastosPage({ searchParams }: PageProps) {
  const profile = await requireRole(["admin", "super_admin"]).catch(() => null);
  const negocioId = profile?.negocioId ?? "00000000-0000-0000-0000-000000000000";
  const cat = param(searchParams?.cat);
  const gastos = await getGastos(negocioId, cat);
  const total = gastos.reduce((sum, gasto) => sum + Number(gasto.monto), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Gastos"
        description="Registro contable de egresos del negocio."
        actions={<GastoCreateButton createAction={createGasto} negocioId={negocioId} />}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <form className="flex flex-wrap gap-2" method="get">
          {CATS.map((c) => {
            const active = cat === c || (!cat && !c);
            return (
              <button
                key={c || "todas"}
                name="cat"
                value={c}
                type="submit"
                className={`rounded-control px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
                  active
                    ? "bg-ds-primary text-white"
                    : "border border-ds-border bg-ds-surface text-ds-fg-muted hover:border-ds-border-strong hover:text-ds-fg"
                }`}
              >
                {c ? c.replace("_", " ") : "Todas"}
              </button>
            );
          })}
        </form>
        <span className="ds-nums rounded-control border border-ds-border bg-ds-surface px-3 py-1.5 text-sm font-semibold text-ds-fg">
          Total: {fmtMoney(total)}
        </span>
      </div>

      {gastos.length === 0 ? (
        <EmptyState icon={Receipt} title="Sin gastos registrados" description={cat ? "No hay gastos en esta categoría." : "Registra el primer gasto operativo."} />
      ) : (
        <div className="overflow-hidden rounded-card border border-ds-border bg-ds-surface shadow-ds-sm">
          <div className="divide-y divide-ds-border">
            {gastos.map((gasto) => (
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" key={gasto.id}>
                <div className="flex min-w-0 items-start gap-3">
                  {gasto.comprobanteUrl && (
                    <a href={gasto.comprobanteUrl} target="_blank" rel="noreferrer" title="Ver comprobante">
                      {/\.(jpg|jpeg|png|webp|gif)/i.test(gasto.comprobanteUrl) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={gasto.comprobanteUrl} alt="comprobante" className="size-11 shrink-0 rounded-control border border-ds-border object-cover transition hover:opacity-80" />
                      ) : (
                        <div className="grid size-11 shrink-0 place-items-center rounded-control border border-ds-border bg-ds-surface-2 text-xl transition hover:opacity-80">📄</div>
                      )}
                    </a>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium capitalize text-ds-fg">{gasto.categoria.replace("_", " ")}</p>
                    <p className="mt-0.5 text-[12px] text-ds-fg-muted">{fmtDate(gasto.fecha)} · {gasto.descripcion || "Sin detalle"}</p>
                    {gasto.comprobanteUrl && (
                      <a href={gasto.comprobanteUrl} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-ds-primary hover:text-ds-primary-hover">
                        Ver comprobante →
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <strong className="ds-nums text-sm font-semibold text-ds-fg">{fmtMoney(gasto.monto)}</strong>
                  <GastoEditButton
                    item={{ id: gasto.id, categoria: gasto.categoria, monto: gasto.monto, fecha: gasto.fecha, descripcion: gasto.descripcion, comprobanteUrl: gasto.comprobanteUrl }}
                    updateAction={updateGasto}
                    negocioId={negocioId}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
