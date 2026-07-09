import Link from "next/link";
import { eq } from "drizzle-orm";
import { Award, Check, Clock3, Globe, Megaphone, MessageCircle, Target, X } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { negocios, type IntegracionEstado } from "@/lib/db/schema";
import { isDemoMode } from "@/lib/demo";
import { solicitarIntegracion } from "@/app/admin/configuracion/actions";

export const dynamic = "force-dynamic";

const COP = (n: number) => "$" + n.toLocaleString("es-CO");

/* Modelo FloorUX: vincular es gratis; campañas y gestión OperUX suman
   incremento mensual sobre la suscripción, confirmado por el negocio. */
const CATALOGO = [
  {
    id: "whatsapp",
    name: "WhatsApp del negocio",
    icon: MessageCircle,
    description: "Recordatorios y confirmaciones de citas por WhatsApp con tu número. Incluido en tu plan.",
    monthly: 0,
    managedMonthly: null as number | null,
    href: "/admin/configuracion#whatsapp",
    cta: "Configurar",
    color: "from-emerald-600 to-teal-600",
  },
  {
    id: "puntos",
    name: "Puntos y fidelización",
    icon: Award,
    description: "Sistema de puntos por consumo, bono de bienvenida y canje. Incluido en tu plan.",
    monthly: 0,
    managedMonthly: null,
    href: "/admin/configuracion",
    cta: "Configurar",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: "registro-publico",
    name: "Registro público de clientes",
    icon: Globe,
    description: "Enlace y QR para que tus clientes se registren solos y entren al programa de puntos. Incluido.",
    monthly: 0,
    managedMonthly: null,
    href: "/admin/configuracion",
    cta: "Ver mi enlace y QR",
    color: "from-cyan-600 to-sky-600",
  },
  {
    id: "whatsapp-campanas",
    name: "Campañas WhatsApp",
    icon: Megaphone,
    description: "Promociones masivas, cumpleaños y reactivación de clientes inactivos con plantillas aprobadas por Meta.",
    monthly: 79000,
    managedMonthly: 199000,
    href: null as string | null,
    cta: null as string | null,
    color: "from-green-600 to-emerald-700",
  },
  {
    id: "meta-ads",
    name: "Meta Ads",
    icon: Megaphone,
    description: "Campañas en Instagram y Facebook medidas desde el CRM. Gestionado: OperUX diseña y optimiza tu pauta.",
    monthly: 99000,
    managedMonthly: 299000,
    href: null,
    cta: null,
    color: "from-blue-600 to-indigo-700",
  },
  {
    id: "google-ads",
    name: "Google Ads",
    icon: Target,
    description: "Aparece cuando te buscan cerca. Conversiones de citas vinculadas a clics de anuncios.",
    monthly: 89000,
    managedMonthly: 249000,
    href: null,
    cta: null,
    color: "from-red-600 to-orange-600",
  },
];

async function getIntegraciones(): Promise<Record<string, IntegracionEstado>> {
  if (isDemoMode()) return {};
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
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-2xl shadow-violet-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(236,72,153,.28),transparent_16rem),radial-gradient(circle_at_85%_70%,rgba(168,85,247,.28),transparent_18rem)]" />
        <div className="relative">
          <div className="mac-dots" />
          <div className="mt-6 flex items-center gap-3 sm:mt-8">
            <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-pink-600 to-rose-500 shadow-lg shadow-pink-500/30">
              <Megaphone className="size-5 text-white" />
            </span>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-pink-300">Integraciones y crecimiento</p>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">Conecta tu negocio al mundo</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Lo esencial va incluido en tu plan: WhatsApp, puntos y registro público de clientes. Las campañas
            y la gestión por OperUX suman un incremento mensual que tú confirmas antes de activar.
          </p>
          {incrementoMensual > 0 && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 py-2 text-sm font-bold">
              Incremento mensual solicitado: <span className="text-amber-300">{COP(incrementoMensual)}</span>
            </p>
          )}
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {CATALOGO.map((item) => {
          const estado = integraciones[item.id];
          const Icon = item.icon;
          const incluido = item.monthly === 0;
          return (
            <article
              key={item.id}
              className="flex flex-col overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/8 backdrop-blur-md transition hover:border-white/20 hover:bg-white/12"
            >
              <div className={`h-2 w-full bg-gradient-to-r ${item.color}`} />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className={`grid size-11 place-items-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg`}>
                    <Icon className="size-5" />
                  </span>
                  {incluido ? (
                    <span className="rounded-full bg-emerald-900/40 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-300">Incluido</span>
                  ) : estado ? (
                    <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wide ${estado.status === "activa" ? "bg-emerald-900/40 text-emerald-300" : "bg-amber-900/40 text-amber-300"}`}>
                      {estado.status === "activa" ? <Check className="size-3" /> : <Clock3 className="size-3" />}
                      {estado.status === "activa" ? "Activa" : "Solicitada"}
                      {estado.managed ? " · OperUX" : ""}
                    </span>
                  ) : (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white/60">Disponible</span>
                  )}
                </div>

                <h3 className="text-lg font-black tracking-tight text-white">{item.name}</h3>
                <p className="flex-1 text-sm leading-6 text-slate-400">{item.description}</p>

                {!incluido && (
                  <div className="rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-xs text-slate-300">
                    <div className="flex items-center justify-between"><span>Incremento mensual</span><b className="text-white">{COP(item.monthly)}</b></div>
                    {item.managedMonthly != null && (
                      <div className="mt-1 flex items-center justify-between"><span>Administrado por OperUX</span><b className="text-white">{COP(item.managedMonthly)}</b></div>
                    )}
                  </div>
                )}

                {incluido && item.href ? (
                  <Link
                    href={item.href}
                    className="mt-1 inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/20"
                  >
                    {item.cta}
                  </Link>
                ) : estado ? (
                  <form action={solicitarIntegracion}>
                    <input type="hidden" name="integracionId" value={item.id} />
                    <input type="hidden" name="accion" value="cancelar" />
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-transparent px-4 py-2.5 text-sm font-bold text-white/70 transition hover:border-red-400/50 hover:text-red-300"
                    >
                      <X className="size-4" /> Cancelar solicitud
                    </button>
                  </form>
                ) : (
                  <form action={solicitarIntegracion} className="grid gap-2.5">
                    <input type="hidden" name="integracionId" value={item.id} />
                    {item.managedMonthly != null && (
                      <label className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/6 px-3.5 py-2.5 text-xs text-slate-300">
                        <input type="checkbox" name="managed" className="size-4 accent-violet-500" />
                        Que OperUX lo administre por mí ({COP(item.managedMonthly)}/mes)
                      </label>
                    )}
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950 transition hover:bg-violet-100"
                    >
                      Solicitar · desde {COP(item.monthly)}/mes
                    </button>
                    <p className="text-[10px] leading-4 text-slate-500">
                      OperUX activa la conexión tras tu solicitud. El incremento aplica desde la activación, nunca antes.
                    </p>
                  </form>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Próximas integraciones</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["TikTok Ads", "Mailchimp", "Google My Business", "Instagram DM automáticos", "Facturación electrónica DIAN"].map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold text-slate-400">
              {tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
