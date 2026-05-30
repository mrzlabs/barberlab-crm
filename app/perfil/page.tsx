import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { logoutAction, resetPasswordAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function PerfilPage({ searchParams }: { searchParams?: { reset?: string } }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const items = [
    ["Nombre", profile.nombre],
    ["Email", profile.email],
    ["Rol", profile.rol],
    ["Telefono", profile.telefono || "Sin telefono"],
    ["Negocio", profile.negocioNombre || "MRZLABS"],
    ["Correo negocio", profile.negocioCorreo || "Sin correo"],
    ["Representante", profile.representante || "Sin representante"],
    ["Plan", profile.plan || "Sin plan"],
    ["Estado", profile.negocioEstado || "Sin estado"],
  ];

  return (
    <main className="surface-grid min-h-dvh p-4 sm:p-6">
      <section className="mx-auto max-w-5xl space-y-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-violet-950/20 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,.32),transparent_18rem),radial-gradient(circle_at_86%_62%,rgba(168,85,247,.38),transparent_20rem)]" />
          <div className="relative">
            <div className="mac-dots" />
            <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Perfil</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight">{profile.nombre}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Consulta tus datos registrados, solicita cambio de contraseña o cierra sesion.
            </p>
          </div>
        </div>

        {searchParams?.reset ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
            Se envio el enlace de cambio de contraseña al correo registrado.
          </p>
        ) : null}

        <section className="glass-panel rounded-[2rem] p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(([label, value]) => (
              <article className="rounded-2xl border bg-white/80 p-4" key={label}>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
                <strong className="mt-2 block break-words text-sm">{value}</strong>
              </article>
            ))}
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <form action={resetPasswordAction}>
              <button className="w-full rounded-2xl border bg-white px-4 py-3 text-sm font-black text-slate-800 hover:border-cyan-300" type="submit">
                Cambiar contraseña
              </button>
            </form>
            <form action={logoutAction}>
              <button className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white" type="submit">
                Cerrar sesion
              </button>
            </form>
          </div>
        </section>
      </section>
    </main>
  );
}
