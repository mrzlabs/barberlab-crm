import { getNegocios } from "@/lib/super-admin/queries";
import { NegocioCreateForm } from "./NegocioCreateForm";
import { NegociosManager } from "./NegociosManager";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stat } from "@/components/ui/Stat";

export const dynamic = "force-dynamic";

export default async function NegociosPage() {
  const negocios = await getNegocios();
  const activos     = negocios.filter((n) => n.estado === "activo").length;
  const suspendidos = negocios.filter((n) => n.estado === "suspendido").length;
  const mrrBase     = negocios.reduce((sum, n) => {
    if (n.estado !== "activo") return sum;
    if (n.plan === "enterprise") return sum + 450_000;
    if (n.plan === "pro")        return sum + 180_000;
    return sum + 90_000;
  }, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Negocios registrados"
        description="Crea barberías, define plan, personaliza identidad, administra usuarios y controla suscripciones."
      />

      <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Stat label="Negocios totales" value={negocios.length} />
        <Stat label="Activos" value={activos} />
        <Stat label="Suspendidos" value={suspendidos} />
        <Stat label="MRR base" value={`$${mrrBase.toLocaleString("es-CO")}`} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[400px_1fr]">
        <NegocioCreateForm />
        <NegociosManager negocios={negocios} />
      </section>
    </div>
  );
}
