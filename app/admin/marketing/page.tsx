import Link from "next/link";
import { eq } from "drizzle-orm";
import { Award, Check, Clock3, Globe, Megaphone, MessageCircle, Target, X } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { negocios, type IntegracionEstado } from "@/lib/db/schema";
import { isDemoMode } from "@/lib/demo-server";
import { solicitarIntegracion } from "@/app/admin/configuracion/actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

const COP = (n: number) => "$" + n.toLocaleString("es-CO");

const CATALOGO = [
  { id: "whatsapp", name: "WhatsApp del negocio", icon: MessageCircle, description: "Recordatorios y confirmaciones de citas por WhatsApp con tu número. Incluido en tu plan.", monthly: 0, managedMonthly: null as number | null, href: "/admin/configuracion#whatsapp", cta: "Configurar" },
  { id: "puntos", name: "Puntos y fidelización", icon: Award, description: "Sistema de puntos por consumo, bono de bienvenida y canje. Incluido en tu plan.", monthly: 0, managedMonthly: null, href: "/admin/configuracion", cta: "Configurar" },
  { id: "registro-publico", name: "Registro público de clientes", icon: Globe, description: "Enlace y QR para que tus clientes se registren solos y entren al programa de puntos. Incluido.", monthly: 0, managedMonthly: null, href: "/admin/configuracion", cta: "Ver mi enlace y QR" },
  { id: "whatsapp-campanas", name: "Campañas WhatsApp", icon: Megaphone, description: "Promociones masivas, cumpleaños y reactivación de clientes inactivos con plantillas aprobadas por Meta.", monthly: 79000, managedMonthly: 199000, href: null as string | null, cta: null as string | null },
  { id: "meta-ads", name: "Meta Ads", icon: Megaphone, description: "Campañas en Instagram y Facebook medidas desde el CRM. Gestionado: OperUX diseña y optimiza tu pauta.", monthly: 99000, managedMonthly: 299000, href: null, cta: null },
  { id: "google-ads", name: "Google Ads", icon: Target, description: "Aparece cuando te buscan cerca. Conversiones de citas vinculadas a clics de anuncios.", monthly: 89000, managedMonthly: 249000, href: null, cta: null },
];

async function getIntegraciones(): Promise<Record<string, IntegracionEstado>> {
  if (await isDemoMode()) return {};
  const profile = await getCurrentProfile();
  if (!profile?.negocioId) return {};
  const [negocio] = await getDb()
    .select({ settings: negocios.settings })
    .from(negocios)
    .where(eq(negocios.id, profile.negocioId))
    .limit(1);
  return negocio?.settings?.integraciones ?? {};
}

export default async function MarketingPage() {
  const integraciones = await getIntegraciones();
  const incrementoMensual = CATALOGO.reduce((sum, c) => {
    const st = integraciones[c.id];
    if (!st) return sum;
    return sum + (st.managed ? (c.managedMonthly ?? c.monthly) : c.monthly);
  }, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Integraciones y crecimiento"
        description="Lo esencial va incluido en tu plan. Campañas y gestión OperUX suman un incremento mensual que confirmas antes de activar."
        actions={incrementoMensual > 0 ? (
          <span className="ds-nums rounded-control border border-ds-border bg-ds-surface px-3 py-1.5 text-[13px] font-medium text-ds-fg">
            Incremento solicitado: <span className="text-ds-warning">{COP(incrementoMensual)}</span>
          </span>
        ) : undefined}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CATALOGO.map((item) => {
          const estado = integraciones[item.id];
          const Icon = item.icon;
          const incluido = item.monthly === 0;
          return (
            <article
              key={item.id}
              className="flex flex-col gap-3 rounded-card border border-ds-border bg-ds-surface p-5 shadow-ds-sm transition-colors hover:border-ds-border-strong"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-control bg-ds-primary-tint text-ds-primary">
                  <Icon className="size-5" />
                </span>
                {incluido ? (
                  <Badge tone="success">Incluido</Badge>
                ) : estado ? (
                  <Badge tone={estado.status === "activa" ? "success" : "warning"}>
                    {estado.status === "activa" ? <Check className="size-3" /> : <Clock3 className="size-3" />}
                    {estado.status === "activa" ? "Activa" : "Solicitada"}{estado.managed ? " · OperUX" : ""}
                  </Badge>
                ) : (
                  <Badge tone="neutral">Disponible</Badge>
                )}
              </div>

              <h3 className="text-[15px] font-semibold text-ds-fg">{item.name}</h3>
              <p className="flex-1 text-[13px] leading-6 text-ds-fg-muted">{item.description}</p>

              {!incluido && (
                <div className="rounded-control border border-ds-border bg-ds-surface-2 px-3.5 py-2.5 text-[12px] text-ds-fg-muted">
                  <div className="flex items-center justify-between"><span>Incremento mensual</span><b className="ds-nums text-ds-fg">{COP(item.monthly)}</b></div>
                  {item.managedMonthly != null && (
                    <div className="mt-1 flex items-center justify-between"><span>Administrado por OperUX</span><b className="ds-nums text-ds-fg">{COP(item.managedMonthly)}</b></div>
                  )}
                </div>
              )}

              {incluido && item.href ? (
                <Link href={item.href} className="inline-flex h-control items-center justify-center rounded-control border border-ds-border-strong bg-ds-surface px-4 text-sm font-medium text-ds-fg transition-colors hover:bg-ds-surface-2">
                  {item.cta}
                </Link>
              ) : estado ? (
                <form action={solicitarIntegracion}>
                  <input type="hidden" name="integracionId" value={item.id} />
                  <input type="hidden" name="accion" value="cancelar" />
                  <button type="submit" className="inline-flex h-control w-full items-center justify-center gap-2 rounded-control border border-ds-border bg-ds-surface px-4 text-sm font-medium text-ds-fg-muted transition-colors hover:border-ds-danger/40 hover:text-ds-danger">
                    <X className="size-4" /> Cancelar solicitud
                  </button>
                </form>
              ) : (
                <form action={solicitarIntegracion} className="grid gap-2.5">
                  <input type="hidden" name="integracionId" value={item.id} />
                  {item.managedMonthly != null && (
                    <label className="flex items-center gap-2.5 rounded-control border border-ds-border bg-ds-surface-2 px-3.5 py-2.5 text-[12px] text-ds-fg-muted">
                      <input type="checkbox" name="managed" className="size-4 accent-ds-primary" />
                      Que OperUX lo administre por mí ({COP(item.managedMonthly)}/mes)
                    </label>
                  )}
                  <button type="submit" className="inline-flex h-control items-center justify-center rounded-control bg-ds-primary px-4 text-sm font-medium text-white transition-colors hover:bg-ds-primary-hover">
                    Solicitar · desde {COP(item.monthly)}/mes
                  </button>
                  <p className="text-[11px] leading-4 text-ds-fg-subtle">
                    OperUX activa la conexión tras tu solicitud. El incremento aplica desde la activación, nunca antes.
                  </p>
                </form>
              )}
            </article>
          );
        })}
      </section>

      <section className="rounded-card border border-ds-border bg-ds-surface p-5">
        <p className="text-[12px] font-medium uppercase tracking-wide text-ds-fg-muted">Próximas integraciones</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["TikTok Ads", "Mailchimp", "Google My Business", "Instagram DM automáticos", "Facturación electrónica DIAN"].map((tag) => (
            <span key={tag} className="rounded-full border border-ds-border bg-ds-surface-2 px-3 py-1 text-[12px] font-medium text-ds-fg-muted">
              {tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
