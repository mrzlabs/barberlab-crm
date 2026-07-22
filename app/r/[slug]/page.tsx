import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Award, CheckCircle2, Gift, KeyRound, LogIn } from "lucide-react";
import { getDb } from "@/lib/db";
import { negocios } from "@/lib/db/schema";
import { getPuntosConfig } from "@/lib/puntos";
import { getVertical } from "@/lib/verticales";
import { isDemoMode } from "@/lib/demo-server";
import { NeuralCanvas } from "@/components/layout/NeuralCanvas";
import { registrarClientePublico } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Regístrate · Operux",
};

type PageProps = {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

async function getNegocioPublico(slug: string) {
  if (await isDemoMode()) {
    return {
      id: "demo",
      nombre: "Smart Style",
      slug,
      slogan: "Tu estilo, nuestro oficio.",
      logoUrl: null as string | null,
      colorPrimario: "#111827",
      colorSecundario: "#22d3ee",
      colorAcento: "#7c3aed",
      estado: "activo",
      settings: { puntos: { habilitado: true, bonoRegistro: 50 } },
    };
  }
  const [negocio] = await getDb()
    .select({
      id: negocios.id,
      nombre: negocios.nombre,
      slug: negocios.slug,
      slogan: negocios.slogan,
      logoUrl: negocios.logoUrl,
      colorPrimario: negocios.colorPrimario,
      colorSecundario: negocios.colorSecundario,
      colorAcento: negocios.colorAcento,
      estado: negocios.estado,
      settings: negocios.settings,
    })
    .from(negocios)
    .where(eq(negocios.slug, slug))
    .limit(1);
  return negocio ?? null;
}

const input = "w-full rounded-xl border border-white/15 bg-white/8 px-3.5 py-3 text-sm text-white outline-none backdrop-blur-sm transition placeholder:text-white/35 focus:border-cyan-400";

export default async function RegistroPublicoPage({ params, searchParams }: PageProps) {
  const negocio = await getNegocioPublico(params.slug);
  if (!negocio || negocio.estado !== "activo") notFound();

  const puntos = getPuntosConfig(negocio.settings);
  const vertical = getVertical(negocio.settings);
  const politicas = negocio.settings?.politicas ?? {};
  const ok = typeof searchParams?.ok === "string" ? searchParams.ok : null;
  const error = typeof searchParams?.error === "string" ? searchParams.error : null;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-slate-950 text-white">
      {/* fondo neural con los colores del negocio */}
      <div className="pointer-events-none fixed inset-0" style={{ zIndex: 0, opacity: 0.8 }}>
        <NeuralCanvas className="h-full w-full" darkMode primaryColor={negocio.colorAcento} />
      </div>
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: 0,
          background: `radial-gradient(60% 45% at 10% 0%, ${negocio.colorSecundario}26, transparent 65%), radial-gradient(55% 40% at 92% 100%, ${negocio.colorAcento}2b, transparent 65%)`,
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-10">
        {/* marca del negocio */}
        <div className="mb-6 flex items-center gap-4">
          <span
            className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/20 text-lg font-black shadow-xl"
            style={{ backgroundColor: negocio.colorAcento }}
          >
            {negocio.logoUrl ? (
              <Image src={negocio.logoUrl} alt={negocio.nombre} width={56} height={56} className="size-full object-cover" unoptimized />
            ) : (
              negocio.nombre.slice(0, 2).toUpperCase()
            )}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-black tracking-tight">{negocio.nombre}</h1>
            {negocio.slogan && <p className="text-sm text-white/60">{negocio.slogan}</p>}
          </div>
        </div>

        {ok ? (
          <div className="rounded-[1.6rem] border border-emerald-400/30 bg-emerald-500/10 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-8 shrink-0 text-emerald-400" />
              <div>
                <p className="text-lg font-black">{ok === "cuenta" ? "Ya tienes una cuenta" : "Registro completo"}</p>
                <p className="mt-0.5 text-sm text-white/70">
                  {ok === "cuenta"
                    ? "Actualizamos tus datos. Inicia sesión para entrar al panel cliente."
                    : "Enviamos un enlace a tu correo. Ábrelo para crear tu clave y entrar al panel cliente."}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {ok !== "cuenta" && (
                <a className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-slate-950" href="mailto:">
                  <KeyRound className="size-4" /> Crear clave
                </a>
              )}
              <a className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-black text-white" href="/login?next=/cliente/reservar">
                <LogIn className="size-4" /> Iniciar sesión
              </a>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.6rem] border border-white/12 bg-white/6 p-6 backdrop-blur-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: negocio.colorSecundario }}>
              Registro de {vertical.vocab.clientes.toLowerCase()}
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight">Únete y acumula beneficios</h2>

            {puntos.habilitado && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-300/25 bg-amber-400/10 px-3.5 py-2.5 text-xs leading-5 text-amber-100">
                <Gift className="mt-0.5 size-4 shrink-0 text-amber-300" />
                <span>
                  {puntos.bonoRegistro > 0 && <><b>{puntos.bonoRegistro} puntos de bienvenida</b> al registrarte. </>}
                  Ganas <b>1 punto por cada ${puntos.pesosPorPunto.toLocaleString("es-CO")}</b> de consumo y los canjeas en tus visitas.
                </span>
              </div>
            )}

            {error && (
              <p className="mt-3 rounded-xl border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-xs font-bold text-red-200">
                {error === "consentimiento"
                  ? "Debes aceptar la política de tratamiento de datos."
                  : error === "correo"
                    ? "Ese correo ya tiene una cuenta o no pudo recibir la invitación. Inicia sesión o recupera tu clave."
                    : error === "config"
                      ? "El acceso de clientes no está configurado."
                      : error === "cuenta"
                        ? "No fue posible crear la cuenta. Intenta de nuevo."
                        : "Revisa tus datos e intenta de nuevo."}
              </p>
            )}

            <form action={registrarClientePublico} className="mt-5 grid gap-3.5">
              <input type="hidden" name="slug" value={negocio.slug} />
              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-white/60">
                Nombre completo
                <input className={input} name="nombre" required minLength={2} maxLength={120} placeholder="Tu nombre" />
              </label>
              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-white/60">
                Celular / WhatsApp
                <input className={input} name="telefono" type="tel" required minLength={7} maxLength={20} placeholder="300 000 0000" />
              </label>
              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-white/60">
                Correo
                <input className={input} name="email" type="email" required maxLength={160} autoComplete="email" placeholder="tucorreo@ejemplo.com" />
              </label>
              <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-white/60">
                Cumpleaños (opcional)
                <input className={input} name="cumpleanos" type="date" style={{ colorScheme: "dark" }} />
              </label>

              <label className="flex items-start gap-2.5 text-xs leading-5 text-white/70">
                <input
                  type="checkbox"
                  name="consentimiento"
                  required={politicas.consentimientoObligatorio ?? true}
                  className="mt-0.5 size-4 shrink-0 accent-cyan-400"
                />
                <span>
                  {politicas.textoRegistro ||
                    "Autorizo el tratamiento de mis datos personales para agendar citas, recibir recordatorios y beneficios del programa de puntos, conforme a la Ley 1581 de 2012."}
                </span>
              </label>

              <button
                type="submit"
                className="mt-1 flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-black text-slate-950 transition hover:brightness-110 active:scale-[0.98]"
                style={{ backgroundColor: negocio.colorSecundario }}
              >
                <Award className="size-4" /> Registrarme{puntos.habilitado && puntos.bonoRegistro > 0 ? ` y ganar ${puntos.bonoRegistro} puntos` : ""}
              </button>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-[11px] text-white/35">© {new Date().getFullYear()} {negocio.nombre} · Operux CRM</p>
      </div>
    </main>
  );
}
