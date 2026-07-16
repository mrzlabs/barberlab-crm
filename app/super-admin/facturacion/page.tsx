import { getFacturacion } from "@/lib/super-admin/queries";
import { FacturacionManager } from "./FacturacionManager";

export const dynamic = "force-dynamic";

export default async function FacturacionPage() {
  const negocios = await getFacturacion();
  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-card bg-ds-surface p-5 shadow-ds-sm sm:p-8">
        <div className="relative">
          <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-ds-primary sm:mt-8">MRZLABS · Costos</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">Facturación y mantenimiento</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ds-fg-muted">
            Plan, costo mensual y fecha de renovación por comercio. Edita plan y fecha directamente.
          </p>
        </div>
      </section>
      <FacturacionManager negocios={negocios} />
    </div>
  );
}
