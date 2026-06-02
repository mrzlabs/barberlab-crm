import Link from "next/link";
import { Megaphone } from "lucide-react";

export const dynamic = "force-dynamic";

const integrations = [
  {
    name: "Meta Ads",
    icon: "📣",
    description: "Conecta tu cuenta de Meta Business y lanza campañas desde el CRM. Mide el ROI de cada anuncio directamente desde tu panel de reportes.",
    status: "soon" as const,
    color: "from-blue-600 to-indigo-700",
    badge: "bg-blue-900/40 text-blue-300",
  },
  {
    name: "Google Ads",
    icon: "🎯",
    description: "Integra Google Ads para medir el ROI de tus campañas. Vincula conversiones de citas con clics de anuncios en tiempo real.",
    status: "soon" as const,
    color: "from-red-600 to-orange-600",
    badge: "bg-red-900/40 text-red-300",
  },
  {
    name: "WhatsApp Business",
    icon: "💬",
    description: "Envía recordatorios de citas automáticos por WhatsApp. Configura mensajes personalizados y reduce el ausentismo de clientes.",
    status: "available" as const,
    href: "/admin/configuracion",
    color: "from-emerald-600 to-teal-600",
    badge: "bg-emerald-900/40 text-emerald-300",
  },
];

export default function MarketingPage() {
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
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-pink-300">Integraciones de Marketing</p>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">Conecta tu negocio al mundo</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Vincula tu CRM con las plataformas de publicidad digital más importantes. Lanza campañas, mide resultados y convierte clientes nuevos directamente desde BarberLab.
          </p>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {integrations.map((item) => (
          <article
            key={item.name}
            className="flex flex-col overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/8 backdrop-blur-md transition hover:border-white/20 hover:bg-white/12"
          >
            <div className={`h-2 w-full bg-gradient-to-r ${item.color}`} />
            <div className="flex flex-1 flex-col gap-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <span className="text-4xl">{item.icon}</span>
                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${item.badge}`}>
                  {item.status === "soon" ? "Próximamente" : "Disponible"}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-black text-white">{item.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
              </div>
              <div className="mt-auto pt-2">
                {item.status === "soon" ? (
                  <button
                    disabled
                    className="w-full cursor-not-allowed rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white/40"
                  >
                    Próximamente
                  </button>
                ) : (
                  <Link
                    href={item.href!}
                    className={`block w-full rounded-2xl bg-gradient-to-r ${item.color} px-4 py-3 text-center text-sm font-black text-white shadow-lg transition hover:opacity-90 hover:scale-[1.01]`}
                  >
                    Configurar
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[1.8rem] border border-white/10 bg-white/5 p-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Próximas integraciones</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {["TikTok Ads", "Mailchimp", "Google My Business", "Instagram DM automáticos", "Calendly sync"].map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold text-slate-400">
              {tag}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
