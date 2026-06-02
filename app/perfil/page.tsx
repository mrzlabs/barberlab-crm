import { redirect } from "next/navigation";
import { X } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/session";
import { logoutAction, requestRenewalAction, resetPasswordAction, updateProfileAction } from "./actions";

export const dynamic = "force-dynamic";

function daysLeft(date: string | null) {
  if (!date) return null;
  const end = new Date(`${date}T23:59:59-05:00`).getTime();
  const now = Date.now();
  return Math.ceil((end - now) / 86_400_000);
}

function homeFor(role: string) {
  if (role === "super_admin") return "/super-admin/dashboard";
  if (role === "admin") return "/admin/dashboard";
  if (role === "empleado") return "/empleado/mi-agenda";
  return "/cliente/mis-citas";
}

export default async function PerfilPage({
  searchParams,
}: {
  searchParams?: { reset?: string; updated?: string; renewal?: string };
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const remainingDays = daysLeft(profile.fechaFin);
  const renewalText = remainingDays === null
    ? "Sin fecha de renovación"
    : remainingDays > 0
      ? `${remainingDays} días para renovar`
      : "Suscripción vencida";
  const canRequestRenewal = profile.rol === "admin" || profile.rol === "super_admin";

  const items = [
    ["Email", profile.email],
    ["Rol", profile.rol],
    ["Negocio", profile.negocioNombre || "MRZLABS"],
    ["Correo negocio", profile.negocioCorreo || "Sin correo"],
    ["Representante", profile.representante || "Sin representante"],
    ["Plan", profile.plan || "Sin plan"],
    ["Estado", profile.negocioEstado || "Sin estado"],
    ["Renovación", profile.fechaFin || "Sin fecha"],
    ["Tiempo restante", renewalText],
  ];

  return (
    <main className="surface-grid relative min-h-dvh overflow-hidden p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" />
      <section className="relative mx-auto grid min-h-[calc(100dvh-3rem)] max-w-5xl place-items-center">
        <div className="w-full rounded-[2rem] border border-white/40 bg-white/72 p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-2xl sm:p-5">
          <div className="relative overflow-hidden rounded-[1.6rem] bg-slate-950 p-5 text-white shadow-xl sm:p-7">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,.32),transparent_18rem),radial-gradient(circle_at_86%_62%,rgba(168,85,247,.38),transparent_20rem)]" />
            <a
              aria-label="Cerrar perfil"
              className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full border border-white/15 bg-white/10 text-white/70 transition hover:bg-white/15 hover:text-white"
              href={homeFor(profile.rol)}
            >
              <X className="size-4" />
            </a>
            <div className="relative">
              <div className="mac-dots" />
              <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Perfil</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{profile.nombre}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Edita datos básicos, solicita recuperación de contraseña o registra una solicitud de renovación.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {searchParams?.reset ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                Se envió el enlace de cambio de contraseña al correo registrado.
              </p>
            ) : null}
            {searchParams?.updated ? (
              <p className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm font-bold text-cyan-700">
                Datos básicos actualizados.
              </p>
            ) : null}
            {searchParams?.renewal ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-700">
                Solicitud de renovación registrada en el panel superadmin.
              </p>
            ) : null}
          </div>

          <section className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.1fr]">
            <form action={updateProfileAction} className="rounded-[1.5rem] border border-slate-200 bg-white/86 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">Datos básicos</p>
              <div className="mt-4 grid gap-3">
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                  Nombre
                  <input
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-cyan-400"
                    defaultValue={profile.nombre}
                    maxLength={120}
                    minLength={2}
                    name="nombre"
                    required
                  />
                </label>
                <label className="grid gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                  Teléfono
                  <input
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-cyan-400"
                    defaultValue={profile.telefono || ""}
                    maxLength={30}
                    name="telefono"
                  />
                </label>
                <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-violet-950" type="submit">
                  Guardar datos
                </button>
              </div>
            </form>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white/86 p-5 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">Suscripción</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <h2 className="text-2xl font-black capitalize text-slate-950">Plan {profile.plan || "sin plan"}</h2>
                  <p className="mt-1 text-sm text-slate-500">{renewalText}</p>
                </div>
                {canRequestRenewal ? (
                  <form action={requestRenewalAction}>
                    <button className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white transition hover:bg-violet-950" type="submit">
                      Continuar suscripción
                    </button>
                  </form>
                ) : null}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {items.map(([label, value]) => (
                  <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4" key={label}>
                    <p className="truncate text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
                    <strong className="mt-2 block break-words text-sm text-slate-900">{value}</strong>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <form action={resetPasswordAction}>
              <button className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-800 transition hover:border-cyan-300" type="submit">
                Cambiar contraseña
              </button>
            </form>
            <form action={logoutAction}>
              <button className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-rose-950" type="submit">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
