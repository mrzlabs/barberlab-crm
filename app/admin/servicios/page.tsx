import { Scissors } from "lucide-react";
import { fmtMoney } from "@/lib/admin/format";
import { getServiciosAdmin } from "@/lib/admin/catalog";
import { SubmitButton } from "@/components/layout/SubmitButton";
import { ServicioCreateButton, ServicioEditButton } from "@/components/admin/ServicioModal";
import { createServicio, toggleServicio, updateServicio } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function AdminServiciosPage() {
  const servicios = await getServiciosAdmin();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Servicios"
        description="Precios, duración y costo base para calcular rentabilidad."
        actions={<ServicioCreateButton createAction={createServicio} />}
      />

      {servicios.length === 0 ? (
        <EmptyState icon={Scissors} title="Sin servicios registrados" description="Crea el primer servicio del catálogo." />
      ) : (
        <div className="overflow-hidden rounded-card border border-ds-border bg-ds-surface shadow-ds-sm">
          <div className="divide-y divide-ds-border">
            {servicios.map((item) => (
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" key={item.id}>
                <div className="min-w-0">
                  <p className="font-medium text-ds-fg">{item.nombre}</p>
                  <p className="mt-0.5 text-[13px] capitalize text-ds-fg-muted">
                    {item.categoria.replace("_", " ")} · {item.duracionMin} min
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-right">
                    <span className="ds-nums block text-sm font-semibold text-ds-fg">{fmtMoney(item.precio)}</span>
                    <span className="ds-nums text-[12px] text-ds-fg-muted">Costo {fmtMoney(item.costoInsumo)}</span>
                  </div>
                  <form action={toggleServicio}>
                    <input name="servicioId" type="hidden" value={item.id} />
                    <input name="activo" type="hidden" value={String(!item.activo)} />
                    <SubmitButton
                      label={item.activo ? "Activo" : "Inactivo"}
                      pendingLabel="…"
                      className={`cursor-pointer rounded-full px-2.5 py-0.5 text-[11px] font-medium transition hover:opacity-70 ${
                        item.activo
                          ? "border border-ds-success/30 bg-ds-success-tint text-ds-success"
                          : "border border-ds-border bg-ds-surface-2 text-ds-fg-muted"
                      }`}
                    />
                  </form>
                  <ServicioEditButton
                    item={{ id: item.id, nombre: item.nombre, categoria: item.categoria, duracionMin: item.duracionMin, precio: item.precio, costoInsumo: item.costoInsumo, activo: item.activo }}
                    updateAction={updateServicio}
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
